import Graph from "graphology";
import type { EdgeDisplayData, NodeDisplayData } from "sigma/types";

export type NodeAttrs = Partial<NodeDisplayData>;
export type EdgeAttrs = Partial<EdgeDisplayData>;
export type GraphAttrs = {
  theme: "dark" | "light";
  text: string;
};

export type VisGraph = Graph<NodeAttrs, EdgeAttrs, GraphAttrs>;

export function graphDirectedLoops(): VisGraph {
  return new Graph({
    allowSelfLoops: true,
    type: "directed",
    multi: true,
  });
}

export function createTestGraph() {
  const graph = graphDirectedLoops();
  graph.addNode("a", { x: 0, y: 0, size: 10, label: "Hello again!" });
  graph.addNode("b", { x: 1, y: 0, size: 10, label: "Mk" });
  graph.addEdge("a", "b", { type: "curve", size: 2 });
  return graph;
}
