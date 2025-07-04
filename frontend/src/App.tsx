import React, { useEffect } from "react";
import axios from "axios";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, BarChart3, AreaChart } from "lucide-react";
import { motion } from "framer-motion";

import StrategyBuilder from "./back/StrategyBuilder";
import PerformanceDashboard from "./back/PerformanceDashboard";
import DataVisualization from "./back/DataVisualization";
import { runBacktest } from "@/api/execution";

export default function App() {
  // Test API connection on load
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/")
      .then((res) => console.log("Backend says:", res.data))
      .catch((err) => console.error("Backend error:", err));
  }, []);

  // Run backtest handler
  const handleRunBacktest = async () => {
    try {
      const response = await runBacktest({
        symbol: "BTC-USDT",
        market_type: "linear",
        exchange: "okx",
        timeframe: "1h",
        candles: 100,
        conditions: [
          {
            logic_operator: "AND",
            conditions: [
              {
                indicator: { type: "EMA", period: 20 },
                operator: ">",
                value: 1000
              }
            ]
          }
        ],
        order_type: "market",
        quantity: 1,
        slippage_bps: 5,
        fee_bps: 10,
        stop_loss_pct: 5,
        take_profit_pct: 10
      });

      console.log("Backtest result:", response);
      alert("✅ Backtest complete. Check console for trades.");
    } catch (error) {
      console.error("Backtest failed:", error);
      alert("❌ Backtest failed. See console for error.");
    }
  };

  return (
    <main className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 text-center">Backtesting Platform</h1>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 rounded-lg mb-6">
          <TabsTrigger value="builder" className="flex items-center gap-2 text-white hover:bg-gray-700">
            <LayoutGrid className="h-4 w-4" /> Strategy Builder
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2 text-white hover:bg-gray-700">
            <BarChart3 className="h-4 w-4" /> Performance Dashboard
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center gap-2 text-white hover:bg-gray-700">
            <AreaChart className="h-4 w-4" /> Data Visualization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <StrategyBuilder />
          </motion.div>
        </TabsContent>

        <TabsContent value="dashboard">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PerformanceDashboard />
          </motion.div>
        </TabsContent>

        <TabsContent value="visualization">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card className="bg-gray-900 text-white">
              <CardContent className="p-4">OHLCV Chart (Multi-timeframe)</CardContent>
            </Card>
            <Card className="bg-gray-900 text-white">
              <CardContent className="p-4">Technical Indicators Overlay</CardContent>
            </Card>
            <Card className="bg-gray-900 text-white">
              <CardContent className="p-4">Trade Entry/Exit Markers</CardContent>
            </Card>
            <Card className="bg-gray-900 text-white col-span-full">
              <CardContent className="p-4">Volume Profile Analysis</CardContent>
            </Card>
            <DataVisualization />
          </motion.div>
        </TabsContent>
      </Tabs>

      <div className="mt-10 flex justify-end">
        <Button
          className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl text-lg"
          onClick={handleRunBacktest}
        >
          Run Backtest
        </Button>
      </div>
    </main>
  );
}
