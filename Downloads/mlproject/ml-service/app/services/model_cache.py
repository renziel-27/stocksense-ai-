import os
import json
import joblib
import time
from tensorflow.keras.models import load_model

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "saved")
os.makedirs(MODEL_DIR, exist_ok=True)
CACHE_HOURS = 12

def get_model_paths(symbol: str):
    model_path = os.path.join(MODEL_DIR, f"{symbol}_model.keras")
    scaler_path = os.path.join(MODEL_DIR, f"{symbol}_scaler.pkl")
    meta_path = os.path.join(MODEL_DIR, f"{symbol}_meta.json")
    return model_path, scaler_path, meta_path

def is_model_fresh(symbol: str):
    _, _, meta_path = get_model_paths(symbol)
    if not os.path.exists(meta_path):
        return False
    with open(meta_path, 'r') as f:
        meta = json.load(f)
    mod_time = meta.get("timestamp", 0)
    return (time.time() - mod_time) / 3600 < CACHE_HOURS

def save_to_cache(symbol: str, model, scaler, metrics):
    model_path, scaler_path, meta_path = get_model_paths(symbol)
    model.save(model_path)
    joblib.dump(scaler, scaler_path)
    with open(meta_path, 'w') as f:
        json.dump({"timestamp": time.time(), "metrics": metrics}, f)

def load_from_cache(symbol: str):
    model_path, scaler_path, meta_path = get_model_paths(symbol)
    try:
        model = load_model(model_path)
        scaler = joblib.load(scaler_path)
        with open(meta_path, 'r') as f:
            meta = json.load(f)
        return model, scaler, meta.get("metrics", {})
    except Exception as e:
        print(f"Cache load error: {e}")
        return None, None, {}
