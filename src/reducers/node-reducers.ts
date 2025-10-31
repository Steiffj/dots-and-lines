import type { EdgeAttrs, GraphAttrs, NodeAttrs } from "../data";
import { type PooledNodeReducer } from "./conductors";

export const nodeReducerCommon: PooledNodeReducer<
  NodeAttrs,
  EdgeAttrs,
  GraphAttrs
> = (_, data, pooled) => {
  const display = pooled ?? {};
  display.color = data.color;
  display.forceLabel = data.forceLabel;
  display.hidden = data.hidden;
  display.highlighted = data.highlighted;
  display.label = data.label;
  display.size = data.size;
  display.type = data.type;
  display.x = data.x;
  display.y = data.y;
  display.zIndex = data.zIndex;
  return display;
};

export const REDucer: PooledNodeReducer<NodeAttrs, EdgeAttrs, GraphAttrs> = (
  _,
  __,
  pooled
) => {
  let display = pooled ?? {};
  display.color = "red";
  return display;
};
