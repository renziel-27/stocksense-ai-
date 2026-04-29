import numpy as np
import os
import json
import joblib
from datetime import datetime
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import (LSTM, Dense, Dropout,
                                     Bidirectional, Input)
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models', 'saved')
os.makedirs(MODELS_DIR, exist_ok=True)

CACHE_HOURS = int(os.getenv("MODEL_CACHE_HOURS", "12"))


def build_model(input_shape):
    """Build Bidirectional LSTM model."""
    model = Sequential([
        Input(shape=input_shape),
        Bidirectional(LSTM(64, return_sequences=True)),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(1)
    ])
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='huber',
        metrics=['mae']
    )
    return model


def get_model_paths(symbol):
    safe = symbol.replace('.', '_').upper()
    return {
        'model':  os.path.join(MODELS_DIR, f'{safe}_model.keras'),
        'scaler': os.path.join(MODELS_DIR, f'{safe}_scaler.pkl'),
        'meta':   os.path.join(MODELS_DIR, f'{safe}_meta.json'),
    }


def is_cache_valid(paths):
    try:
        if not all(os.path.exists(p) for p in paths.values()):
            return False
        with open(paths['meta'], 'r') as f:
            meta = json.load(f)
        trained_at = datetime.fromisoformat(meta['trained_at'])
        age_hours = (datetime.now() - trained_at).total_seconds() / 3600
        return age_hours < CACHE_HOURS
    except Exception:
        return False


def train_model(symbol, X_train, y_train, X_test, y_test, scaler, feature_cols):
    """Train model and save to disk. Returns (model, metrics)."""
    print(f"[lstm] Training model for {symbol}...")
    paths = get_model_paths(symbol)

    input_shape = (X_train.shape[1], X_train.shape[2])
    model = build_model(input_shape)

    callbacks = [
        EarlyStopping(
            monitor='val_loss',
            patience=8,
            restore_best_weights=True,
            min_delta=0.0001
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=4,
            min_lr=1e-6
        )
    ]

    history = model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=32,
        validation_split=0.15,
        callbacks=callbacks,
        verbose=0
    )

    # Evaluate on test set
    test_loss, test_mae = model.evaluate(X_test, y_test, verbose=0)

    # Compute MAPE on test set
    y_pred_scaled = model.predict(X_test, verbose=0).flatten()
    n_features = len(feature_cols)
    
    y_pred_real = np.array([
        inverse_transform_single(scaler, v, n_features) for v in y_pred_scaled
    ])
    y_test_real = np.array([
        inverse_transform_single(scaler, v, n_features) for v in y_test
    ])

    # Avoid division by zero
    mask = y_test_real != 0
    mape = float(np.mean(np.abs(
        (y_test_real[mask] - y_pred_real[mask]) / y_test_real[mask]
    )) * 100)

    rmse = float(np.sqrt(np.mean((y_test_real - y_pred_real) ** 2)))
    mae_real = float(np.mean(np.abs(y_test_real - y_pred_real)))

    # R² score
    ss_res = np.sum((y_test_real - y_pred_real) ** 2)
    ss_tot = np.sum((y_test_real - np.mean(y_test_real)) ** 2)
    r_squared = float(1 - ss_res / ss_tot) if ss_tot != 0 else 0.0

    metrics = {
        'mape': round(mape, 4),
        'rmse': round(rmse, 4),
        'mae':  round(mae_real, 4),
        'r_squared': round(r_squared, 4),
        'training_samples': int(len(X_train)),
        'test_samples': int(len(X_test)),
        'epochs_run': len(history.history['loss'])
    }

    # Save model, scaler, meta
    model.save(paths['model'])
    joblib.dump(scaler, paths['scaler'])
    with open(paths['meta'], 'w') as f:
        json.dump({
            'trained_at': datetime.now().isoformat(),
            'symbol': symbol,
            'feature_cols': feature_cols,
            'metrics': metrics
        }, f)

    print(f"[lstm] Training complete. MAPE: {mape:.2f}%, R²: {r_squared:.4f}")
    return model, metrics


def load_cached_model(symbol):
    """Load model + scaler + feature_cols from disk."""
    paths = get_model_paths(symbol)
    model = load_model(paths['model'])
    scaler = joblib.load(paths['scaler'])
    with open(paths['meta'], 'r') as f:
        meta = json.load(f)
    return model, scaler, meta['feature_cols'], meta.get('metrics', {})


def train_or_load(symbol, X_train, y_train, X_test, y_test, scaler, feature_cols):
    """Use cache if valid, otherwise retrain."""
    paths = get_model_paths(symbol)
    if is_cache_valid(paths):
        print(f"[lstm] Loading cached model for {symbol}")
        try:
            model, cached_scaler, cached_features, metrics = load_cached_model(symbol)
            return model, cached_scaler, cached_features, metrics
        except Exception as e:
            print(f"[lstm] Cache load failed ({e}), retraining...")
    
    model, metrics = train_model(
        symbol, X_train, y_train, X_test, y_test, scaler, feature_cols
    )
    return model, scaler, feature_cols, metrics


def predict_next_day(model, scaler, df_train, feature_cols):
    """Predict next day's closing price."""
    from app.services.preprocessor import prepare_last_sequence, SEQUENCE_LENGTH
    
    seq = prepare_last_sequence(df_train, scaler, feature_cols)
    pred_scaled = model.predict(seq, verbose=0)[0][0]
    n_features = len(feature_cols)
    pred_price = inverse_transform_single(scaler, pred_scaled, n_features)
    return float(pred_price)


def predict_overlay(model, scaler, X_test, feature_cols):
    """Return predicted prices for the test set (for chart overlay)."""
    n_features = len(feature_cols)
    preds_scaled = model.predict(X_test, verbose=0).flatten()
    return [
        float(inverse_transform_single(scaler, v, n_features))
        for v in preds_scaled
    ]


def inverse_transform_single(scaler, value, n_features):
    dummy = np.zeros((1, n_features))
    dummy[0, 0] = float(value)
    return scaler.inverse_transform(dummy)[0, 0]
