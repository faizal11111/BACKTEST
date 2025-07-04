from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import pandas as pd

router = APIRouter()

class Trade(BaseModel):
    pnl: float
    duration_hours: float
    notional: float

class MetricsRequest(BaseModel):
    starting_balance: float
    trades: List[Trade]
    benchmark_returns: Optional[List[float]] = None

@router.post("/metrics")
def compute_metrics(req: MetricsRequest):
    if not req.trades:
        return {"error": "No trades provided"}

    df = pd.DataFrame([t.dict() for t in req.trades])
    df["returns"] = df["pnl"] / req.starting_balance

    total_pnl = df["pnl"].sum()
    pnl_pct = total_pnl / req.starting_balance * 100
    trade_count = len(df)
    win_rate = (df["pnl"] > 0).mean() * 100
    avg_duration = df["duration_hours"].mean()
    largest_win = df["pnl"].max() / req.starting_balance * 100
    largest_loss = df["pnl"].min() / req.starting_balance * 100
    turnover = df["notional"].sum() / req.starting_balance * 100

    # Volatility & Sharpe
    returns = df["returns"]
    volatility = returns.std() * np.sqrt(252)
    sharpe = returns.mean() / returns.std() * np.sqrt(252) if returns.std() else 0
    sortino = returns.mean() / returns[returns < 0].std() * np.sqrt(252) if (returns < 0).std() else 0

    # Max Drawdown
    equity = req.starting_balance + df["pnl"].cumsum()
    rolling_max = equity.cummax()
    drawdowns = equity - rolling_max
    max_drawdown_pct = (drawdowns / rolling_max).min() * 100
    max_drawdown_abs = drawdowns.min()

    # CAGR
    duration_days = df["duration_hours"].sum() / 24
    years = duration_days / 365
    cagr = ((req.starting_balance + total_pnl) / req.starting_balance) ** (1 / years) - 1 if years > 0 else 0

    # Calmar Ratio
    calmar = cagr / abs(max_drawdown_pct / 100) if max_drawdown_pct else 0

    # VaR (95%)
    var_95 = np.percentile(returns, 5) * req.starting_balance

    # Leverage estimate
    leverage = turnover / 100

    # Beta (if benchmark provided)
    beta = None
    if req.benchmark_returns and len(req.benchmark_returns) == len(df):
        cov = np.cov(returns, req.benchmark_returns)[0][1]
        var_benchmark = np.var(req.benchmark_returns)
        beta = cov / var_benchmark if var_benchmark else None

    return {
        "pnl_pct": round(pnl_pct, 3),
        "pnl_$": round(total_pnl, 2),
        "cagr": round(cagr * 100, 2),
        "sharpe": round(sharpe, 2),
        "sortino": round(sortino, 2),
        "calmar": round(calmar, 2),
        "max_drawdown_pct": round(max_drawdown_pct, 2),
        "max_drawdown_$": round(max_drawdown_abs, 2),
        "volatility_pct": round(volatility * 100, 2),
        "total_trades": trade_count,
        "win_rate_pct": round(win_rate, 2),
        "avg_trade_duration_hr": round(avg_duration, 2),
        "largest_win_pct": round(largest_win, 2),
        "largest_loss_pct": round(largest_loss, 2),
        "turnover_pct": round(turnover, 2),
        "value_at_risk_95": round(var_95, 2),
        "leverage_estimate": round(leverage, 2),
        "beta_to_benchmark": round(beta, 2) if beta is not None else None
    }

