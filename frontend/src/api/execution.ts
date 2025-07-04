// src/api/execution.ts
import axios from "./axios";
import { Candle } from "./ohlcv";

export interface ExecutionRequest {
  candles: Candle[];
  short_window: number;
  long_window: number;
  order_type: "market" | "limit";
  quantity: number;
  slippage_bps: number;
  fee_bps: number;
  stop_loss_pct: number;
  take_profit_pct: number;
}

export interface TradeResult {
  timestamp: number;
  price: number;
  quantity: number;
  side: "buy" | "sell";
  pnl: number;
}

export const executeStrategy = async (
  payload: ExecutionRequest
): Promise<{ executed_trades: TradeResult[] }> => {
  const res = await axios.post("/strategy/execute", payload);
  return res.data;
};
// Types for full backtest strategy
export interface BacktestRequest {
  symbol: string;
  market_type: string;
  exchange: string;
  timeframe: string;
  candles?: number;
  conditions: {
    logic_operator: "AND" | "OR";
    conditions: {
      indicator: { type: "EMA" | "RSI" | "MACD"; period: number };
      operator: ">" | "<" | ">=" | "<=" | "==";
      value: number;
    }[];
  }[];
  order_type: "market" | "limit";
  quantity: number;
  slippage_bps: number;
  fee_bps: number;
  stop_loss_pct: number;
  take_profit_pct: number;
}

// Response from /strategy/backtest
export interface BacktestResult {
  symbol: string;
  executed_trades: TradeResult[];
}

// Call to /strategy/backtest
export const runBacktest = async (
  payload: BacktestRequest
): Promise<BacktestResult> => {
  const res = await axios.post("/strategy/backtest", payload);
  return res.data;
};