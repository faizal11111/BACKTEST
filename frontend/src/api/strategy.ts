// src/api/strategy.ts
import axios from "./axios";
import { Node, Edge } from "reactflow";
export type IndicatorType = "EMA" | "RSI" | "MACD";
export type Operator = ">" | "<" | ">=" | "<=" | "==";

export interface StrategyRequest {
  symbol: string;
  market_type: string;
  exchange: string;
  timeframe: string;
  candles?: number;
  conditions: {
    logic_operator: "AND" | "OR";
    conditions: {
      indicator: { type: IndicatorType; period: number };
      operator: Operator;
      value: number;
    }[];
  }[];
}

export interface StrategyValidationResponse {
  symbol: string;
  timeframe: string;
  valid: boolean;
  results: { logic_block: number; result: boolean }[];
}

export const validateStrategy = async (
  payload: StrategyRequest
): Promise<StrategyValidationResponse> => {
  const res = await axios.post("/strategy/validate", payload);
  return res.data;
};
export const runBacktest = async (payload: StrategyRequest & {
  order_type: "market" | "limit";
  quantity: number;
  slippage_bps: number;
  fee_bps: number;
  stop_loss_pct: number;
  take_profit_pct: number;
}) => {
  const res = await axios.post("/strategy/backtest", payload);
  return res.data;
};
export const saveFlowToBackend = async (nodes: Node[], edges: Edge[]) => {
  await axios.post("/strategy/flow/save", { nodes, edges });
};

export const loadFlowFromBackend = async (): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  const res = await axios.get("/strategy/flow/load");
  return res.data;
};

