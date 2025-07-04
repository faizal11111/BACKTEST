import axios from "./axios";

// Matches FastAPI model
export interface Trade {
  pnl: number;
  duration_hours: number;
  notional: number;
}

export interface MetricsRequest {
  starting_balance: number;
  trades: Trade[];
  benchmark_returns?: number[];
}

export interface MetricsResponse {
  pnl_pct: number;
  pnl_$: number;
  cagr: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  max_drawdown_pct: number;
  max_drawdown_$: number;
  volatility_pct: number;
  total_trades: number;
  win_rate_pct: number;
  avg_trade_duration_hr: number;
  largest_win_pct: number;
  largest_loss_pct: number;
  turnover_pct: number;
  value_at_risk_95: number;
  leverage_estimate: number;
  beta_to_benchmark: number | null;
}

export const calculateMetrics = async (
  payload: MetricsRequest
): Promise<MetricsResponse> => {
  const res = await axios.post<MetricsResponse>("/metrics/metrics", payload);
  return res.data;
};
