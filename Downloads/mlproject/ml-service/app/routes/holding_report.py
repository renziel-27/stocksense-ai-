from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__),'..'))
from services.holding_report import generate_holding_report

router = APIRouter()

class HoldingReq(BaseModel):
    symbol:          str
    buy_price:       float
    quantity:        int   = 1
    holding_days:    int   = 30
    buy_date:        Optional[str] = None
    current_price:   float
    predicted_price: float
    indicators:      dict  = {}
    recommendation:  dict  = {}

@router.post("/holding-report")
async def holding_report(req: HoldingReq):
    try:
        return generate_holding_report(
            symbol=req.symbol.upper(),
            current_price=req.current_price,
            predicted_price=req.predicted_price,
            indicators=req.indicators,
            recommendation=req.recommendation,
            buy_price=req.buy_price,
            quantity=req.quantity,
            holding_days=req.holding_days,
            buy_date=req.buy_date,
        )
    except Exception as e:
        raise HTTPException(500, f"{type(e).__name__}: {e}")
