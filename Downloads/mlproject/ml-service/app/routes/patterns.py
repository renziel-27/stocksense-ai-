from fastapi import APIRouter
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.preprocessor import fetch_and_prepare
from services.pattern_detector import detect_patterns

router = APIRouter()

@router.get("/patterns")
def get_patterns(symbol: str, period: str = "1y"):
    df_train, df_display, scaler, X_train, y_train, X_test, y_test, feature_cols = fetch_and_prepare(symbol, period)
    patterns, sr = detect_patterns(df_display)
    return {"symbol": symbol, "patterns": patterns, "support_resistance": sr}
