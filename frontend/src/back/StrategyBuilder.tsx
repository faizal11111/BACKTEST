import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveFlowToBackend, loadFlowFromBackend } from "@/api/strategy";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node

} from "reactflow";
import "reactflow/dist/style.css";

import { validateStrategy, StrategyRequest, StrategyValidationResponse } from "@/api/strategy";

const StrategyBuilder = () => {
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [timeframe] = useState("1h");
  const [marketType] = useState("spot");
  const [exchange] = useState("okx");
  const [indicatorType] = useState<"EMA">("EMA");
  const [period, setPeriod] = useState(20);
  const [operator] = useState<">">(">");
  const [threshold, setThreshold] = useState(100);
  const [validationResult, setValidationResult] = useState<string>("Not validated");

  const initialNodes: Node[] = [
    { id: "1", type: "input", data: { label: "Start" }, position: { x: 0, y: 0 } },
    { id: "2", data: { label: "EMA(20)" }, position: { x: 200, y: 0 } },
    { id: "3", type: "output", data: { label: "Buy Signal" }, position: { x: 400, y: 0 } },
  ];
  const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), []);
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, []);
 const saveFlow = async () => {
  try {
    await saveFlowToBackend(nodes, edges);
    console.log("✅ Flow saved to backend");
  } catch (err) {
    console.error("❌ Save failed", err);
  }
};
  const loadFlow = async () => {
  try {
    const { nodes: savedNodes, edges: savedEdges } = await loadFlowFromBackend();
    setNodes(savedNodes);
    setEdges(savedEdges);
    console.log("✅ Flow loaded from backend");
  } catch (err) {
    console.error("❌ Load failed", err);
  }
};
  const handleValidate = async () => {
    const payload: StrategyRequest = {
      symbol,
      market_type: marketType,
      exchange,
      timeframe,
      conditions: [
        {
          logic_operator: "AND",
          conditions: [
            {
              indicator: { type: indicatorType, period },
              operator,
              value: threshold,
            },
          ],
        },
      ],
    };

    try {
      const res: StrategyValidationResponse = await validateStrategy(payload);
      setValidationResult(res.valid ? "✔ Strategy is valid" : "❌ Strategy is invalid");
    } catch {
      setValidationResult("❌ Validation failed");
    }
  };

  const handleAddIndicatorNode = () => {
    const id = (nodes.length + 1).toString();
    const newNode: Node = {
      id,
      data: { label: `EMA(${period})` },
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
    };
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, { id: `e${nodes.length}-${id}`, source: nodes[nodes.length - 1].id, target: id }]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card className="bg-gray-900 text-white">
        <CardContent className="p-4 space-y-2">
          <h2 className="font-bold text-lg mb-2">Asset / Market Selector</h2>
          <select
            className="w-full border border-gray-700 bg-gray-800 text-white rounded p-2"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          >
            <option>BTC/USDT</option>
            <option>ETH/USDT</option>
            <option>AAPL</option>
          </select>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 text-white">
        <CardContent className="p-4 space-y-2">
          <h2 className="font-bold text-lg mb-2">Indicator Configuration</h2>
          <input
            type="number"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            placeholder="Period (e.g. 20)"
            className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded"
          />
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddIndicatorNode}>
            ➕ Add EMA Node
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 text-white">
        <CardContent className="p-4 space-y-2">
          <h2 className="font-bold text-lg mb-2">Threshold</h2>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            placeholder="Value (e.g. 100)"
            className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-900 text-white">
        <CardContent className="p-4 space-y-2">
          <h2 className="font-bold text-lg mb-2">Real-time Strategy Validation</h2>
          <p className={`font-medium ${validationResult.includes("✔") ? "text-green-400" : "text-red-400"}`}>
            {validationResult}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleValidate}>
            Validate Strategy
          </Button>
        </CardContent>
      </Card>

      <Card className="col-span-full bg-gray-900 text-white">
        <CardContent className="p-4">
          <h2 className="font-bold text-lg mb-4">Visual Strategy Flow</h2>
          <div className="h-96 rounded border border-gray-700">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={onEdgeClick}
              proOptions={{ hideAttribution: true }}
              fitView
            >
              
              <Controls />
              <Background />
            </ReactFlow>
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={saveFlow} className="bg-blue-600 px-3 py-1 rounded text-white">
             💾 Save Flow
            </button>
            <button onClick={loadFlow} className="bg-gray-700 px-3 py-1 rounded text-white">
              🔁 Load Flow
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyBuilder;
