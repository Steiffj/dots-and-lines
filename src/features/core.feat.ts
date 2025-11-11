import {
  defaultEdgeLabels,
  edgePaletteReducer,
  edgeReducerPoolInit,
} from "../reducers/edge-reducers";
import { nodeReducerCommon } from "../reducers/node-reducers";
import type {
  EdgeReducerRegistry,
  NodeReducerRegistry,
} from "../reducers/reducer.registry";
import type { Feature, FeatureInit } from "./types";

export class FeatCore implements Feature, FeatureInit {
  readonly id = Symbol("core");
  state = { active: true };
  get active() {
    return true;
  }

  constructor(
    private readonly nodeReducers: NodeReducerRegistry,
    private readonly edgeReducers: EdgeReducerRegistry
  ) {}

  init(): Feature {
    this.nodeReducers.register(this.id, nodeReducerCommon);
    this.edgeReducers.register(this.id, edgeReducerPoolInit);
    this.edgeReducers.register(this.id, edgePaletteReducer); // TODO maybe move into a color scheme feature when that becomes more sophisticated
    this.edgeReducers.register(this.id, defaultEdgeLabels); // TODO temporary
    return this;
  }
}
