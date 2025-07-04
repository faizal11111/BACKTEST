import pandas as pd
from typing import List, Dict


def simulate_order_execution(
    df: pd.DataFrame,
    entry_signal: pd.Series,
    order_type: str = "market",
    quantity: float = 1.0,
    slippage_bps: float = 5.0,
    fee_bps: float = 10.0,
    stop_loss_pct: float = None,
    take_profit_pct: float = None
) -> List[Dict]:
    """
    Simulates trade execution based on entry signals.

    Args:
        df (pd.DataFrame): OHLCV dataframe.
        entry_signal (pd.Series): Boolean Series indicating where to enter trades.
        order_type (str): "market" or "limit"
        quantity (float): Trade size in units or %
        slippage_bps (float): Slippage in basis points.
        fee_bps (float): Fee in basis points.
        stop_loss_pct (float): SL as percent of entry price.
        take_profit_pct (float): TP as percent of entry price.

    Returns:
        List[Dict]: List of executed trades with PnL and duration.
    """
    trades = []
    in_position = False
    entry_price = 0
    entry_time = None

    for i in range(1, len(df)):
        if entry_signal.iloc[i] and not in_position:
            # Simulate entry
            raw_entry = df["close"].iloc[i]
            entry_price = raw_entry * (1 + slippage_bps / 10000) if order_type == "market" else raw_entry
            entry_time = df["timestamp"].iloc[i]
            in_position = True
            continue

        if in_position:
            high = df["high"].iloc[i]
            low = df["low"].iloc[i]
            close = df["close"].iloc[i]

            # Apply SL/TP logic
            sl_hit = stop_loss_pct is not None and low <= entry_price * (1 - stop_loss_pct / 100)
            tp_hit = take_profit_pct is not None and high >= entry_price * (1 + take_profit_pct / 100)

            if sl_hit or tp_hit or i == len(df) - 1:
                # Simulate exit
                exit_price = entry_price * (1 - stop_loss_pct / 100) if sl_hit else \
                             entry_price * (1 + take_profit_pct / 100) if tp_hit else \
                             close * (1 - slippage_bps / 10000)

                exit_time = df["timestamp"].iloc[i]
                duration = (exit_time - entry_time) / 1000 / 60 / 60  # in hours

                # Calculate PnL
                gross_pnl = (exit_price - entry_price) * quantity
                total_fee = (entry_price + exit_price) * quantity * fee_bps / 10000
                net_pnl = gross_pnl - total_fee

                trades.append({
                    "entry_price": float(entry_price),
                    "exit_price": float(exit_price),
                    "entry_time": int(entry_time),
                    "exit_time": int(exit_time),
                    "duration_hours": float(duration),
                    "pnl": float(net_pnl),
                    "sl_hit": sl_hit,
                    "tp_hit": tp_hit
                })

                in_position = False

    return trades
