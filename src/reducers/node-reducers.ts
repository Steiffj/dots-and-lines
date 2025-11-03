import type { DALEdgeAttrs, DALGraphAttrs, DALNodeAttrs } from "../dal-types";
import type { PooledNodeReducer } from "./types";

export const nodeReducerCommon: PooledNodeReducer<
  DALNodeAttrs,
  DALEdgeAttrs,
  DALGraphAttrs
> = (_, data, pooled) => {
  const display = pooled ?? {};
  display.color = data.color;
  display.forceLabel = data.forceLabel;
  display.hidden = data.hidden;
  display.highlighted = data.highlighted;
  display.label = data.label;
  display.size = data.size ?? 5;
  display.type = data.type;
  display.x = data.x;
  display.y = data.y;
  display.zIndex = data.zIndex;
  return display;
};
