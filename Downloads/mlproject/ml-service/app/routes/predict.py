from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
import traceback
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.preprocessor import (
    fetch_and_prepare, prepare_last_sequence, SEQUENCE_LENGTH
)
from services.lstm_model import train_or_load, predict_overlay
from services.indicators import compute_all
from services.recommendation_engine import compute_recommendation

try:
    from services.pattern_detector import detect_patterns as detect_all_patterns
except ImportError:
    def detect_all_patterns(df): return []

router = APIRouter()

class PredictRequest(BaseModel):
    symbol: str
    period: str = "1y"

def generate_ai_summary(symbol, predicted_price, current_price,
                        trend, confidence, indicators, patterns,
                        support_resistance):
    change_pct = (predicted_price - current_price) / current_price * 100
    rsi = indicators.get('rsi') or 50
    adx = indicators.get('adx') or 0
    macd = indicators.get('macd') or 0

    rsi_desc  = "overbought" if rsi > 70 else "oversold" if rsi < 30 else "neutral"
    trend_str = "strong trending" if adx > 25 else "ranging/consolidating"
    macd_sig  = "bullish" if macd > 0 else "bearish"

    sent1 = (f"{symbol} shows a {trend.lower()} outlook with the LSTM model "
             f"predicting ₹{predicted_price:,.2f} ({change_pct:+.2f}%) "
             f"at {confidence:.0f}% confidence.")

    sent2 = (f"RSI at {rsi:.1f} ({rsi_desc}), ADX at {adx:.1f} "
             f"({trend_str}), MACD showing {macd_sig} momentum.")

    top_patterns = [p['pattern_name'] for p in patterns[:2]] if patterns else []
    pattern_str = (f"Patterns detected: {', '.join(top_patterns)}."
                   if top_patterns else "No major chart patterns detected.")

    sr = support_resistance or {}
    supports    = sr.get('support', [])
    resistances = sr.get('resistance', [])
    sr_str = ""
    if supports and resistances:
        sr_str = (f" Key support at ₹{supports[0]['price']:,.2f}, "
                  f"resistance at ₹{resistances[0]['price']:,.2f}.")

    return f"{sent1} {sent2} {pattern_str}{sr_str}"


@router.post("/predict")
async def predict(req: PredictRequest):
    symbol = req.symbol.upper().strip()
    period = req.period.lower().strip()

    print(f"\n[predict] Request: symbol={symbol}, period={period}")

    try:
        # Step 1: Fetch + preprocess data
        (df_train, df_display, scaler,
         X_train, y_train,
         X_test, y_test,
         feature_cols) = fetch_and_prepare(symbol, period)

        # Step 2: Train or load cached model
        model, scaler, feature_cols, metrics = train_or_load(
            symbol, X_train, y_train, X_test, y_test, scaler, feature_cols
        )

        # Step 3: Predict next day
        seq = prepare_last_sequence(df_train, scaler, feature_cols)
        pred_scaled = model.predict(seq, verbose=0)[0][0]
        n_features = len(feature_cols)
        
        dummy = np.zeros((1, n_features))
        dummy[0, 0] = float(pred_scaled)
        predicted_price = float(scaler.inverse_transform(dummy)[0, 0])

        # Step 4: Get overlay predictions for test period
        overlay_preds = predict_overlay(model, scaler, X_test, feature_cols)
        
        # Map overlay to dates in df_train
        split_idx = int(len(df_train) * 0.8)
        overlay_dates = df_train.index[
            split_idx + SEQUENCE_LENGTH: split_idx + SEQUENCE_LENGTH + len(overlay_preds)
        ]
        predictions_overlay = [
            {
                'date': str(overlay_dates[i].date()),
                'predicted': round(overlay_preds[i], 2),
                'actual': round(float(df_train['Close'].iloc[
                    split_idx + SEQUENCE_LENGTH + i
                ]), 2)
            }
            for i in range(min(len(overlay_preds), len(overlay_dates)))
        ]

        # Step 5: Compute indicators on display data
        indicators = compute_all(df_display)

        # Step 6: Detect patterns on display data
        try:
            res = detect_all_patterns(df_display)
            patterns = res[0] if isinstance(res, tuple) else res
        except Exception as e:
            print(f"[predict] Pattern detection error (non-fatal): {e}")
            patterns = []

        # Step 7: Support & Resistance
        try:
            from services.pattern_detector import detect_patterns
            res = detect_patterns(df_display)
            sr = res[1] if isinstance(res, tuple) else {'support': [], 'resistance': []}
        except Exception:
            sr = {'support': [], 'resistance': []}

        # Step 8: Compute metrics
        current_price = float(df_display['Close'].iloc[-1])
        change_pct = (predicted_price - current_price) / current_price * 100
        trend = "Bullish" if predicted_price > current_price else "Bearish"
        mape = metrics.get('mape', 0)
        confidence = min(98, max(0, round(100 - mape * 5, 1)))

        # Step 9: Historical data for chart (display period)
        historical_data = [
            {
                'date':   str(row.Index.date()),
                'open':   round(float(row.Open), 2),
                'high':   round(float(row.High), 2),
                'low':    round(float(row.Low), 2),
                'close':  round(float(row.Close), 2),
                'volume': int(row.Volume)
            }
            for row in df_display.itertuples()
        ]

        # Step 10: AI summary
        ai_summary = generate_ai_summary(
            symbol, predicted_price, current_price,
            trend, confidence, indicators, patterns, sr
        )

        recommendation = compute_recommendation(
            predicted_price  = predicted_price,
            current_price    = current_price,
            indicators       = indicators,
            patterns         = patterns,
            support_resistance = sr,
            model_metrics    = {
                **metrics,
                'confidence': confidence,
                'mape': mape
            }
        )

        response = {
            "symbol": symbol,
            "current_price": round(current_price, 2),
            "predicted_price": round(predicted_price, 2),
            "predicted_change_pct": round(change_pct, 2),
            "trend": trend,
            "confidence": confidence,
            "error_rate": mape,
            "historical_data": historical_data,
            "predictions_overlay": predictions_overlay,
            "indicators": indicators,
            "patterns": patterns,
            "support_resistance": sr,
            "ai_summary": ai_summary,
            "model_metrics": metrics,
            "recommendation": recommendation
        }

        print(f"[predict] Done. Predicted: ₹{predicted_price:.2f}, Trend: {trend}")
        return response

    except ValueError as e:
        print(f"[predict] ValueError: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        tb = traceback.format_exc()
        print(f"[predict] Unexpected error:\n{tb}")
        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {str(e)}"
        )
