from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from routes.predict  import router as predict_router
from routes.stock_data import router as stock_router
from routes.patterns import router as patterns_router
from routes.train    import router as train_router
from routes.holding_report import router as hr_router

app = FastAPI(title="StockSense ML Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(stock_router)
app.include_router(patterns_router)
app.include_router(train_router)
app.include_router(hr_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"[global error] {tb}")
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc),
            "type": type(exc).__name__,
            "detail": "Check ML service terminal for full traceback"
        }
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "StockSense ML"}
