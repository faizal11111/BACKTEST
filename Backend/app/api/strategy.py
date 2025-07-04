from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal, Optional, Dict, Any
from app.services.okx_service import fetch_ohlcv
from app.services.indicators import calculate_ema, calculate_rsi, calculate_macd
from app.services.execution import simulate_order_execution
import pandas as pd

router = APIRouter()

# ----------- Models -----------
class IndicatorConfig(BaseModel):
    type: Literal["EMA", "RSI", "MACD"]
    period: int

class Condition(BaseModel):
    indicator: IndicatorConfig
    operator: Literal[">", "<", ">=", "<=", "=="]
    value: float

class LogicBlock(BaseModel):
    conditions: List[Condition]
    logic_operator: Literal["AND", "OR"] = "AND"

class StrategyRequest(BaseModel):
    symbol: str
    market_type: str
    exchange: str
    conditions: List[LogicBlock]
    timeframe: str = "1h"
    candles: Optional[int] = 100

class BacktestRequest(StrategyRequest):
    order_type: Literal["market", "limit"] = "market"
    quantity: float = 1.0
    slippage_bps: float = 5.0
    fee_bps: float = 10.0
    stop_loss_pct: float = 5.0
    take_profit_pct: float = 10.0

# ----------- Strategy Validation Endpoint -----------
@router.post("/validate")
async def validate_strategy(request: StrategyRequest):
    if not request.conditions:
        raise HTTPException(status_code=400, detail="No strategy conditions provided")

    raw_data = await fetch_ohlcv(request.symbol, request.timeframe, request.candles)
    ohlcv_data = raw_data.get("data", [])
    if not ohlcv_data:
        raise HTTPException(status_code=404, detail="OHLCV data not found")

    df = pd.DataFrame(ohlcv_data, columns=["timestamp", "open", "high", "low", "close", "volume", "quoteVolume"])
    df = df.iloc[::-1]
    df[["open", "high", "low", "close", "volume"]] = df[["open", "high", "low", "close", "volume"]].astype(float)

    results = []
    for idx, block in enumerate(request.conditions):
        logic_result = []
        for cond in block.conditions:
            indicator_type = cond.indicator.type
            period = cond.indicator.period

            if indicator_type == "EMA":
                series = calculate_ema(df, period)
            elif indicator_type == "RSI":
                series = calculate_rsi(df, period)
            elif indicator_type == "MACD":
                series, _, _ = calculate_macd(df)
            else:
                continue

            latest_value = series.iloc[-1]
            op = cond.operator
            target = cond.value
            condition_result = eval(f"{latest_value} {op} {target}")
            logic_result.append(condition_result)

        final_block_result = all(logic_result) if block.logic_operator == "AND" else any(logic_result)
        results.append({"logic_block": idx + 1, "result": final_block_result})

    return {
        "symbol": request.symbol,
        "timeframe": request.timeframe,
        "valid": all(r["result"] for r in results),
        "results": results
    }

# ----------- Backtest Endpoint -----------
@router.post("/backtest")
async def backtest_strategy(request: BacktestRequest):
    raw_data = await fetch_ohlcv(request.symbol, request.timeframe, request.candles)
    ohlcv_data = raw_data.get("data", [])
    if not ohlcv_data:
        raise HTTPException(status_code=404, detail="OHLCV data not found")

    df = pd.DataFrame(ohlcv_data, columns=["timestamp", "open", "high", "low", "close", "volume", "quoteVolume"])
    df = df.iloc[::-1]
    df[["open", "high", "low", "close", "volume"]] = df[["open", "high", "low", "close", "volume"]].astype(float)

    signal_series = []
    for block in request.conditions:
        block_result = pd.Series([True] * len(df))
        for cond in block.conditions:
            if cond.indicator.type == "EMA":
                indicator = calculate_ema(df, cond.indicator.period)
            elif cond.indicator.type == "RSI":
                indicator = calculate_rsi(df, cond.indicator.period)
            elif cond.indicator.type == "MACD":
                indicator, _, _ = calculate_macd(df)
            else:
                continue

            comparison = eval(f"indicator {cond.operator} {cond.value}")
            block_result &= comparison if block.logic_operator == "AND" else block_result | comparison

        signal_series.append(block_result)

    entry_signal = signal_series[0]
    for sig in signal_series[1:]:
        entry_signal &= sig

    trades = simulate_order_execution(
        df,
        entry_signal=entry_signal,
        order_type=request.order_type,
        quantity=request.quantity,
        slippage_bps=request.slippage_bps,
        fee_bps=request.fee_bps,
        stop_loss_pct=request.stop_loss_pct,
        take_profit_pct=request.take_profit_pct
    )

    return {"symbol": request.symbol, "executed_trades": trades}

# ----------- Visual Flow State (Save & Load) -----------
flow_state = {"nodes": [], "edges": []}

class FlowData(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

@router.post("/flow/save")
async def save_flow(data: FlowData):
    flow_state["nodes"] = data.nodes
    flow_state["edges"] = data.edges
    return {"message": "Flow saved successfully"}

@router.get("/flow/load")
async def load_flow():
    return flow_state

