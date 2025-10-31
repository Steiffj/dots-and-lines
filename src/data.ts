import Graph from "graphology";
import clusters from "graphology-generators/random/clusters";
import circlepack from "graphology-layout/circlepack";
import type { EdgeDisplayData, NodeDisplayData } from "sigma/types";
import type { ColorPalette } from "./palettes";
import chroma from "chroma-js";

export type NodeAttrs = Partial<NodeDisplayData> & {
  cluster?: number;
};
export type EdgeAttrs = Partial<EdgeDisplayData>;
export type GraphAttrs = {
  theme?: "dark" | "light";
  text?: string;
  palette?: ColorPalette;
};

export type VisGraph = Graph<NodeAttrs, EdgeAttrs, GraphAttrs>;

export function graphDirectedLoops(): VisGraph {
  return new Graph({
    allowSelfLoops: true,
    type: "directed",
    multi: true,
  });
}

export function createTestGraph(
  options: { order: number; size: number; clusters: number },
  palette: ColorPalette
) {
  const g = clusters(Graph, options) as VisGraph;
  circlepack.assign(g, { hierarchyAttributes: ["cluster"] });
  const colors = chroma
    .scale(palette.span)
    .mode("lch")
    .colors(options.clusters);

  let i = 0;
  g.updateEachNodeAttributes((node, attrs) => {
    const cluster = attrs.cluster;
    return {
      ...attrs,
      size: g.degree(node) / 2,
      label: `Node n°${++i}`,
      color: colors[cluster!],
    };
  });

  g.setAttribute("palette", palette);
  return g;
}
