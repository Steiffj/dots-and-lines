import type { EdgeAttrs, GraphAttrs, NodeAttrs } from "../data";
import { type PooledEdgeReducer } from "./conductors";

export const edgeReducerCommon: PooledEdgeReducer<
  NodeAttrs,
  EdgeAttrs,
  GraphAttrs
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

export const BLUEducer: PooledEdgeReducer<NodeAttrs, EdgeAttrs, GraphAttrs> = (
  _,
  data,
  pooled
) => {
  let display = pooled ?? {};
  display.color = "blue";
  display.size = data.size ?? 1;
  return display;
};
