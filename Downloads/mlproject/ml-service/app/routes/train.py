from fastapi import APIRouter, HTTPException
from app.schemas.request_schemas import PredictRequest
import json
import numpy as np

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.preprocessor import fetch_and_prepare
from services.lstm_model import train_model

router = APIRouter()

@router.post("/train")
def run_training_pipeline(request: PredictRequest):
    df_train, df_display, scaler, X_train, y_train, X_test, y_test, feature_cols = fetch_and_prepare(request.symbol, "2y")
    
    if len(X_train) == 0:
        raise HTTPException(status_code=400, detail="Insufficient data to create sequences.")
        
    model, metrics = train_model(request.symbol, X_train, y_train, X_test, y_test, scaler, feature_cols)
    
    return {"message": "Training successful", "metrics": metrics}
