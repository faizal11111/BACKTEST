from fastapi import APIRouter, Query
from app.services.okx_service import fetch_ohlcv, fetch_trades

router = APIRouter()

@router.get("/candles")
async def get_candles(symbol: str = Query("BTC-USDT"), interval: str = "1h", limit: int = 100):
    return await fetch_ohlcv(symbol, interval, limit)

@router.get("/trades")
async def get_trades(symbol: str = Query(...), limit: int = 100):
    return await fetch_trades(symbol, limit)
