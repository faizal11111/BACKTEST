import httpx
from typing import Optional

BASE_URL = "https://www.okx.com"



async def fetch_ohlcv(symbol: str, interval: str = "1h", limit: int = 100):
    url = f"{BASE_URL}/api/v5/market/candles"
    params = {"instId": symbol, "bar": interval, "limit": limit}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        print("OKX Candle Response:",response.status_code, response.text)
        response.raise_for_status()
        return response.json()

async def fetch_trades(symbol: str, limit: int = 100):
    url = f"{BASE_URL}/api/v5/market/trades"
    params = {"instId": symbol, "limit": limit}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()
