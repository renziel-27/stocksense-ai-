import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import ta
import joblib
import os
import json
from datetime import datetime

SEQUENCE_LENGTH = 60
MIN_ROWS = 100
FEATURES = ['Close', 'Open', 'High', 'Low', 'Volume',
            'rsi', 'macd', 'sma20', 'bb_pct']


def flatten_columns(df):
    """Handle yfinance MultiIndex columns."""
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[0] for col in df.columns]
    df.columns = [str(c).strip() for c in df.columns]
    return df


def add_features(df):
    """Add technical indicator features. Always returns df with FEATURES columns."""
    close = df['Close']
    
    # RSI
    try:
        df['rsi'] = ta.momentum.RSIIndicator(close, window=14).rsi()
    except Exception:
        df['rsi'] = 50.0

    # MACD
    try:
        df['macd'] = ta.trend.MACD(close).macd()
    except Exception:
        df['macd'] = 0.0

    # SMA20
    try:
        df['sma20'] = close.rolling(window=20).mean()
    except Exception:
        df['sma20'] = close

    # Bollinger %B
    try:
        bb = ta.volatility.BollingerBands(close, window=20)
        df['bb_pct'] = bb.bollinger_pband()
    except Exception:
        df['bb_pct'] = 0.5

    # Fill NaN — forward fill first, then backward fill, then 0
    df = df.ffill().bfill().fillna(0)
    return df


def download_with_fallback(symbol: str, period: str = "2y"):
    import time
    errors = []
    
    # Attempt 1: Native YFinance (v1.3.0 handles anti-bot internally)
    try:
        df = yf.download(
            symbol,
            period=period,
            interval="1d",
            auto_adjust=True,
            progress=False,
            threads=False
        )
        if df is not None and len(df) > 50:
            print(f"[yfinance] plain yf.download success")
            return flatten_columns(df)
    except Exception as e:
        errors.append(f"plain yf.download: {e}")
        
    print(f"[fetch] yfinance failed: {errors}. Trying Alpha Vantage fallback...")

    # Attempt 2: Alpha Vantage Fallback
    try:
        from app.services.alpha_vantage_fetcher import fetch_from_alpha_vantage
        df = fetch_from_alpha_vantage(symbol, period=period)
        if df is not None and len(df) > 50:
            return df
    except Exception as e:
        errors.append(f"Alpha Vantage fetch failed: {e}")

    raise ValueError(
        f"Could not fetch data for '{symbol}' from any source. "
        f"Check internet or API limits. Errors: {errors}"
    )

def fetch_and_prepare(symbol: str, period: str = "1y"):
    """
    Always fetches 2Y data for training.
    Returns (df_train, df_display, scaler, X_train, y_train,
             X_test, y_test, feature_cols)
    """
    symbol = symbol.upper().strip()

    print(f"[preprocessor] Downloading {symbol} 2Y data for training...")
    df = download_with_fallback(symbol, period="2y")

    # Ensure required OHLCV columns exist
    for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
        if col not in df.columns:
            raise ValueError(f"Missing column '{col}' in yfinance data for {symbol}")

    # Keep only OHLCV, drop others
    df = df[['Open', 'High', 'Low', 'Close', 'Volume']].copy()
    df = df.dropna(subset=['Close', 'Open', 'High', 'Low'])
    df.index = pd.to_datetime(df.index)
    df = df.sort_index()

    if len(df) < MIN_ROWS:
        raise ValueError(
            f"Not enough data for {symbol}: got {len(df)} rows, need {MIN_ROWS}."
        )

    # Add technical features
    df = add_features(df)

    # Training data = full 2Y
    df_train = df.copy()

    # Display data = sliced to user's requested period
    period_days = {
        '3mo': 90, '3m': 90,
        '6mo': 180, '6m': 180,
        '1y': 365, '1yr': 365,
        '2y': 730, '2yr': 730,
        '5y': 1825, '5yr': 1825,
    }
    days = period_days.get(period.lower(), 365)
    cutoff = pd.Timestamp.now(tz=df.index.tz) - pd.Timedelta(days=days)
    df_display = df[df.index >= cutoff].copy()

    if len(df_display) < 10:
        df_display = df.tail(90).copy()  # fallback

    print(f"[preprocessor] Train rows: {len(df_train)}, Display rows: {len(df_display)}")

    # Scale using only training data
    scaler = MinMaxScaler(feature_range=(0, 1))
    feature_cols = FEATURES
    
    # Only use columns that exist
    feature_cols = [f for f in feature_cols if f in df_train.columns]
    
    scaled = scaler.fit_transform(df_train[feature_cols].values)
    scaled_df = pd.DataFrame(scaled, columns=feature_cols, index=df_train.index)

    # Create sequences
    X, y = [], []
    close_idx = feature_cols.index('Close')
    
    for i in range(SEQUENCE_LENGTH, len(scaled_df)):
        X.append(scaled_df.values[i - SEQUENCE_LENGTH:i])
        y.append(scaled_df.values[i, close_idx])

    X, y = np.array(X), np.array(y)

    if len(X) < 10:
        raise ValueError(
            f"Not enough sequences after processing: {len(X)}. Need at least 10."
        )

    # 80/20 split
    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    print(f"[preprocessor] X_train: {X_train.shape}, X_test: {X_test.shape}")

    return (df_train, df_display, scaler,
            X_train, y_train, X_test, y_test, feature_cols)


def inverse_transform_price(scaler, value, n_features):
    """Safely inverse transform a single Close price value."""
    dummy = np.zeros((1, n_features))
    dummy[0, 0] = float(value)  # Close is always index 0
    return float(scaler.inverse_transform(dummy)[0, 0])


def prepare_last_sequence(df_train, scaler, feature_cols):
    """Prepare the last 60-day sequence for next-day prediction."""
    scaled = scaler.transform(df_train[feature_cols].values)
    last_seq = scaled[-SEQUENCE_LENGTH:]
    return np.array([last_seq])  # shape: (1, 60, n_features)
