import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchCandles, Candle } from "@/api/ohlcv";
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line,
  CartesianGrid,
} from "recharts";

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const DataVisualization = () => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCandles("BTC-USDT", "1h", 100);
        setCandles(data.reverse());
      } catch (err) {
        setError("Failed to fetch OHLCV data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="w-full min-h-screen bg-black px-4 py-8 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">

        {/* OHLCV Chart */}
        <Card className="bg-[#0e1625] border border-white/20 rounded-xl shadow-lg flex flex-col min-h-[300px] col-span-full">
          <div className="p-6">
            <h2 className="text-white text-lg font-bold mb-2">OHLCV Chart (Multi-timeframe)</h2>
            <div className="h-[260px] rounded-md bg-gray-800 border border-gray-700 p-3">
              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={candles}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTime}
                      stroke="#aaa"
                    />
                    <YAxis stroke="#aaa" domain={["dataMin", "dataMax"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                      labelFormatter={(v) => `Time: ${formatTime(v as number)}`}
                      formatter={(v: number, name: string) => [`${v}`, name.toUpperCase()]}
                    />
                    <Bar dataKey="volume" fill="#3b82f6" name="Volume" />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Close Price"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Card>

        {/* Reusable card layout below */}
        {[
          { title: "Technical Indicator Overlays", content: "[Indicator Overlays Placeholder]" },
          { title: "Trade Entry/Exit Markers", content: "[Trade Marker Chart Placeholder]" },
          { title: "Volume Profile Analysis", content: "[Volume Profile Chart Placeholder]" },
          { title: "Risk Metrics", content: "[Risk Metrics Placeholder]" },
          { title: "Strategy vs Benchmark", content: "[Benchmark Comparison Placeholder]" },
        ].map(({ title, content }) => (
          <Card
            key={title}
            className="bg-[#0e1625] border border-white/20 rounded-xl shadow-lg flex flex-col min-h-[280px]"
          >
            <div className="p-6 flex flex-col flex-1">
              <h2 className="text-white text-lg font-bold mb-2">{title}</h2>
              <div className="flex-grow flex items-center justify-center rounded-md bg-gray-800 border border-gray-700">
                <span className="text-gray-400">{content}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DataVisualization;
