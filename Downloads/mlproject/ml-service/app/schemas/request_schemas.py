from pydantic import BaseModel
from typing import Optional

class PredictRequest(BaseModel):
    symbol: str
    period: Optional[str] = "1y"

class AlertRequest(BaseModel):
    symbol: str
    targetPrice: float
    condition: str
