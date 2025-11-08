import chroma from "chroma-js";
import Graph from "graphology";
import clusters from "graphology-generators/random/clusters";
import circlepack from "graphology-layout/circlepack";
import type { DALGraph } from "./dal-types";
import type { ColorPalette } from "./color-scheme/types";
import circular from "graphology-layout/circular";

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

export function createSupernode(order: number, palette: ColorPalette) {
  const colors = chroma.scale(palette.span).mode("lch").colors(order);
  const g = new Graph() as DALGraph;
  const supernode = "super";
  g.addNode(supernode, {
    label: "Supernode!",
    size: 10,
    color: palette.span[0],
  });

  for (let i = 0; i < order; i++) {
    g.addNode(i, {
      size: 3,
      label: `Node n°${i + 1}`,
      color: colors[i],
    });
    g.addEdge(supernode, i);
  }

  circular.assign(g, { scale: order * 3 });
  g.setNodeAttribute(supernode, "x", 0);
  g.setNodeAttribute(supernode, "y", 0);
  g.setAttribute("palette", palette);
  return g;
}
