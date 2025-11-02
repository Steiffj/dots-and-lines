import {
  defaultEdgeLabels,
  edgePaletteReducer,
  edgeReducerCommon,
} from "../reducers/edge-reducers";
import { nodeReducerCommon } from "../reducers/node-reducers";
import type { FeatureRegistration } from "./types";

const featCore: FeatureRegistration = (_, reducers) => {
  reducers.node.register(nodeReducerCommon);
  reducers.edge.register(edgeReducerCommon);
  reducers.edge.register(edgePaletteReducer);
  reducers.edge.register(defaultEdgeLabels);
};

export default featCore;
