// src/api/trades.ts
import axios from "./axios";

export interface Trade {
  timestamp: number;
  price: number;
  size: number;
  side: string;
}

export const fetchTrades = async (
  symbol: string,
  limit = 100
): Promise<Trade[]> => {
  const res = await axios.get<Trade[]>(`/ohlcv/trades`, {
    params: { symbol, limit },
  });
  return res.data;
};
