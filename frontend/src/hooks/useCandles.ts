// src/hooks/useCandles.ts
import api from '@/api';

export async function fetchCandles(symbol: string, interval = "1h", limit = 100) {
  const res = await api.get(`/ohlcv/candles`, {
    params: { symbol, interval, limit }
  });
  return res.data;


}
