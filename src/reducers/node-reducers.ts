import type { DALEdgeAttrs, DALGraphAttrs, DALNodeAttrs } from "../dal-types";
import type { PooledNodeReducer } from "./types";

export const nodeReducerCommon: PooledNodeReducer<
  DALNodeAttrs,
  DALEdgeAttrs,
  DALGraphAttrs
> = (_, data, pooled) => {
  pooled.color = data.color;
  pooled.forceLabel = data.forceLabel;
  pooled.hidden = data.hidden;
  pooled.highlighted = data.highlighted;
  pooled.label = data.label;
  pooled.size = data.size ?? 5;
  pooled.type = data.type;
  pooled.x = data.x;
  pooled.y = data.y;
  pooled.zIndex = data.zIndex;
  return pooled;
};
