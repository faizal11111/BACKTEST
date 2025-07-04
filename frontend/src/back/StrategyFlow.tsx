import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  { id: "1", type: "input", data: { label: "Start" }, position: { x: 0, y: 0 } },
  { id: "2", data: { label: "Indicator: SMA 20" }, position: { x: 200, y: 0 } },
  { id: "3", type: "output", data: { label: "Buy Signal" }, position: { x: 400, y: 0 } },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

const StrategyFlow = () => {
  return (
    <div style={{ height: 400 }} className="rounded border border-gray-700">
      <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default StrategyFlow;
