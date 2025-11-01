import chroma from "chroma-js";
import Graph from "graphology";
import clusters from "graphology-generators/random/clusters";
import circlepack from "graphology-layout/circlepack";
import type { ColorPalette } from "./palettes";
import type { DALGraph } from "./dal-types";

export function graphDirectedLoops(): DALGraph {
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
  const g = clusters(Graph, options) as DALGraph;
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
