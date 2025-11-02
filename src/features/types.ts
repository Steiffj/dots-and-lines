import type { DALEdgeAttrs, DALGraphAttrs, DALNodeAttrs } from "../dal-types";
import type { EventRegistry } from "../events/event.registry";
import type {
  EdgeReducerRegistry,
  NodeReducerRegistry,
} from "../reducers/reducer.registry";

export type FeatureRegistration = (
  events: EventRegistry,
  reducers: {
    node: NodeReducerRegistry<DALNodeAttrs, DALEdgeAttrs, DALGraphAttrs>;
    edge: EdgeReducerRegistry<DALNodeAttrs, DALEdgeAttrs, DALGraphAttrs>;
  }
) => void;
