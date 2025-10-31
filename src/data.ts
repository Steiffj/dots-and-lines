import Graph from "graphology";
import clusters from "graphology-generators/random/clusters";
import circlepack from "graphology-layout/circlepack";
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
  const g = clusters(Graph, { order: 3500, size: 6000, clusters: 9 });
  circlepack.assign(g, { hierarchyAttributes: ["cluster"] });
  return g;
}
