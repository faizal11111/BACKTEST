import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { calculateMetrics, MetricsResponse } from "@/api/metrics";

const mockReturns = [
  { day: "Mon", return: 2 },
  { day: "Tue", return: -1 },
  { day: "Wed", return: 3 },
  { day: "Thu", return: -2 },
  { day: "Fri", return: 1.5 },
];

const mockDrawdown = [
  { time: "T1", value: 0 },
  { time: "T2", value: -5 },
  { time: "T3", value: -10 },
  { time: "T4", value: -3 },
  { time: "T5", value: -12 },
];

const mockPnL = [
  { trade: 1, profit: 120 },
  { trade: 2, profit: -80 },
  { trade: 3, profit: 150 },
  { trade: 4, profit: -20 },
];

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const result = await calculateMetrics({
          starting_balance: 10000,
          trades: [
            { pnl: 120, duration_hours: 5, notional: 500 },
            { pnl: -80, duration_hours: 4, notional: 600 },
            { pnl: 150, duration_hours: 3, notional: 700 },
            { pnl: -20, duration_hours: 6, notional: 550 },
          ],
          benchmark_returns: [0.01, -0.005, 0.008, -0.002],
        });
        setMetrics(result);
      } catch (error) {
        console.error("Failed to fetch metrics", error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-white">
      {/* Return Distribution */}
      <Card className="bg-gray-900">
        <CardContent className="p-4">
          <h2 className="font-bold mb-2">Return Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockReturns}>
              <XAxis dataKey="day" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#fff" }} />
              <Bar dataKey="return" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Drawdown Analysis */}
      <Card className="bg-gray-900">
        <CardContent className="p-4">
          <h2 className="font-bold mb-2">Drawdown Analysis</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockDrawdown}>
              <XAxis dataKey="time" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#fff" }} />
              <Line type="monotone" dataKey="value" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* PnL Distribution */}
      <Card className="bg-gray-900">
        <CardContent className="p-4">
          <h2 className="font-bold mb-2">PnL Summary</h2>
          <p className="text-sm">Total PnL: <span className="font-semibold text-green-400">${metrics?.pnl_$ ?? "..."}</span></p>
          <p className="text-sm">PnL %: <span className="font-semibold text-blue-400">{metrics?.pnl_pct ?? "..."}%</span></p>
        </CardContent>
      </Card>

      {/* Trade Duration Analysis */}
      <Card className="bg-gray-900">
        <CardContent className="p-4">
          <h2 className="font-bold mb-2">Trade Duration</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockPnL}>
              <XAxis dataKey="trade" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#fff" }} />
              <Area dataKey="profit" stroke="#3b82f6" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-sm mt-2">Avg. Duration: <span className="text-yellow-400 font-semibold">{metrics?.avg_trade_duration_hr ?? "..."} hrs</span></p>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card className="bg-gray-900">
        <CardContent className="p-4">
          <h2 className="font-bold mb-2">Risk Metrics</h2>
          {metrics ? (
            <ul className="text-sm space-y-1">
              <li>Sharpe Ratio: <span className="font-semibold text-blue-400">{metrics.sharpe}</span></li>
              <li>Sortino Ratio: <span className="font-semibold text-green-400">{metrics.sortino}</span></li>
              <li>Max Drawdown: <span className="font-semibold text-red-400">{metrics.max_drawdown_pct}%</span></li>
              <li>Calmar Ratio: <span className="font-semibold text-yellow-400">{metrics.calmar}</span></li>
              <li>Volatility: <span className="font-semibold text-white">{metrics.volatility_pct}%</span></li>
            </ul>
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </CardContent>
      </Card>

      {/* Strategy vs. Benchmark */}
      <Card className="bg-gray-900">
        <CardContent className="p-4">
          <h2 className="font-bold mb-2">Strategy vs. Benchmark</h2>
          {metrics ? (
            <ul className="text-sm space-y-1">
              <li>Beta: <span className="font-semibold text-purple-400">{metrics.beta_to_benchmark ?? "N/A"}</span></li>
              <li>Turnover: <span className="font-semibold text-orange-400">{metrics.turnover_pct}%</span></li>
              <li>VaR (95%): <span className="font-semibold text-red-300">${metrics.value_at_risk_95}</span></li>
              <li>Leverage: <span className="font-semibold text-yellow-300">{metrics.leverage_estimate}x</span></li>
            </ul>
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;
