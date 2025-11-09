import type { EventRegistry } from "../events/event.registry";
import type {
  EdgeReducerRegistry,
  NodeReducerRegistry,
} from "../reducers/reducer.registry";

/**
 * @todo handle:
 * - Feature activity start/end methods
 * - Stop putting feature state directly in Sigma's graph
 * - Pass feature state to events and reducers
 * - Pass feature settings manager events and reducers
 */
export type FeatureState =
  | {
      active: false;
    }
  | {
      active: true;
      nodes?: string[];
      edges?: string[];
    };

export type FeatureDefinition = (
  events: EventRegistry,
  reducers: {
    node: NodeReducerRegistry;
    edge: EdgeReducerRegistry;
  }
) => symbol;

export interface Feature {
  readonly id: symbol;
  readonly state: FeatureState;
  readonly active: boolean;
  start(): FeatureState;
  stop(): FeatureState;
}

export interface FeatureInit {
  init(): Feature;
}
