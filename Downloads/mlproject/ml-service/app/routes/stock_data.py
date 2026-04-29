from fastapi import APIRouter, HTTPException
from typing import Optional
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.preprocessor import fetch_and_prepare
from services.indicators import compute_all

router = APIRouter()

@router.get("/stock-data")
def get_stock_data(symbol: str, period: str = "1y"):
    df_train, df_display, scaler, X_train, y_train, X_test, y_test, feature_cols = fetch_and_prepare(symbol, period)
    
    if df_display.empty:
        raise HTTPException(status_code=404, detail="No data found or issue with fetching symbol.")
        
    indicators = compute_all(df_display)
    records = json.loads(df_display.reset_index().to_json(orient='records', date_format='iso'))
    
    return {
        "symbol": symbol,
        "historical_data": records,
        "indicators": indicators
    }
