import type { EventRegistry } from "../events/event.registry";
import type {
  EdgeReducerRegistry,
  NodeReducerRegistry,
} from "../reducers/reducer.registry";

export type FeatureRegistration = (
  events: EventRegistry,
  reducers: {
    node: NodeReducerRegistry;
    edge: EdgeReducerRegistry;
  }
) => symbol;
