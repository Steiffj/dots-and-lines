import type { EventRegistry } from "../events/event.registry";
import type {
  EdgeReducerRegistry,
  NodeReducerRegistry,
} from "../reducers/reducer.registry";

export type FeatureDefinition = (
  events: EventRegistry,
  reducers: {
    node: NodeReducerRegistry;
    edge: EdgeReducerRegistry;
  }
) => symbol;
