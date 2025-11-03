import {
  defaultEdgeLabels,
  edgePaletteReducer,
  edgeReducerPoolInit,
} from "../reducers/edge-reducers";
import { nodeReducerCommon } from "../reducers/node-reducers";
import type { FeatureRegistration } from "./types";

const featCore: FeatureRegistration = (_, reducers) => {
  reducers.node.register(nodeReducerCommon);
  reducers.edge.register(edgeReducerPoolInit);
  reducers.edge.register(edgePaletteReducer); // TODO maybe move into a color scheme feature when that becomes more sophisticated
  reducers.edge.register(defaultEdgeLabels);
};

export default featCore;
