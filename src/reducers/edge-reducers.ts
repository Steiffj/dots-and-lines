import type { DALEdgeAttrs, DALGraphAttrs, DALNodeAttrs } from "../graph-types";
import { type PooledEdgeReducer } from "./conductors";

export const edgeReducerCommon: PooledEdgeReducer<
  DALNodeAttrs,
  DALEdgeAttrs,
  DALGraphAttrs
> = (_, data, pooled) => {
  const display = pooled ?? {};
  display.color = data.color;
  display.forceLabel = data.forceLabel;
  display.hidden = data.hidden;
  display.label = data.label;
  display.size = data.size ?? 1;
  display.type = data.type;
  display.zIndex = data.zIndex;
  return display;
};

export const BLUEducer: PooledEdgeReducer<
  DALNodeAttrs,
  DALEdgeAttrs,
  DALGraphAttrs
> = (_, data, pooled) => {
  let display = pooled ?? {};
  display.color = "blue";
  display.size = data.size ?? 1;
  return display;
};

export const edgePaletteReducer: PooledEdgeReducer<
  DALNodeAttrs,
  DALEdgeAttrs,
  DALGraphAttrs
> = (_, __, pooled, sigma) => {
  let display = pooled ?? {};
  const palette = sigma.getGraph().getAttribute("palette");
  if (palette) {
    display.color = palette.edge;
  }
  return display;
};

export const defaultEdgeLabels: PooledEdgeReducer<
  DALNodeAttrs,
  DALEdgeAttrs,
  DALGraphAttrs
> = (edge, data, pooled, sigma) => {
  let display = pooled ?? {};
  if (!data.label && !display.label) {
    const g = sigma.getGraph();
    const source = g.source(edge);
    const target = g.target(edge);
    display.label = `${source} -> ${target}`;
  }
  return display;
};
