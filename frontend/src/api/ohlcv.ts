import axios from "./axios";

export type RawCandle = [
  string, // timestamp (milliseconds since epoch as string)
  string, // open
  string, // high
  string, // low
  string, // close
  string, // volume
  
];

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const fetchCandles = async (
  symbol: string,
  interval: string,
  limit = 100
): Promise<Candle[]> => {
  const res = await axios.get<{ data: RawCandle[] }>("/ohlcv/candles", {
    params: { symbol, interval, limit },
  });

  const raw: RawCandle[] = res.data.data;

  const candles: Candle[] = raw.map(([timestamp, open, high, low, close, volume]) => ({
    timestamp: Number(timestamp),
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    volume: parseFloat(volume),
  }));

  return candles;
};

