import {
  defaultEdgeLabels,
  edgePaletteReducer,
  edgeReducerPoolInit,
} from "../reducers/edge-reducers";
import { nodeReducerCommon } from "../reducers/node-reducers";
import type { FeatureRegistration } from "./types";

const FEAT = Symbol("core");
export const FEAT_CORE = FEAT;
const featCore: FeatureRegistration = (_, reducers) => {
  reducers.node.register(FEAT, nodeReducerCommon);
  reducers.edge.register(FEAT, edgeReducerPoolInit);
  reducers.edge.register(FEAT, edgePaletteReducer); // TODO maybe move into a color scheme feature when that becomes more sophisticated
  reducers.edge.register(FEAT, defaultEdgeLabels);
  return FEAT;
};

export default featCore;
