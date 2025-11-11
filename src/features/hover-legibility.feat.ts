import type { DALSigma } from "../dal-types";
import type { EventRegistry } from "../events/event.registry";
import type {
  EdgeReducerRegistry,
  NodeReducerRegistry,
} from "../reducers/reducer.registry";
import type { Feature, FeatureInit, FeatureState } from "./types";

type State = FeatureState &
  (
    | {
        active: true;
        hovered: string;
        type: "node" | "edge";
      }
    | {
        active: false;
      }
  );

export class FeatHoverLegibility implements Feature, FeatureInit {
  id = Symbol("hover legibility");
  state: State = { active: false };

  get active() {
    return this.state.active;
  }

  constructor(
    private readonly events: EventRegistry,
    private readonly nodeReducers: NodeReducerRegistry,
    private readonly edgeReducers: EdgeReducerRegistry
  ) {
    if (
      events.sigma !== nodeReducers.sigma ||
      events.sigma !== edgeReducers.sigma ||
      nodeReducers.sigma !== edgeReducers.sigma
    ) {
      throw new Error(
        "Hover legibility feature was provided inconsistent Sigma instances in registries."
      );
    }
  }

  isHovered(key: string, type: "node" | "edge") {
    return (
      this.state.active &&
      this.state.hovered === key &&
      this.state.type === type
    );
  }

  isActive(key: string, type: "node" | "edge") {
    if (!this.state.active) {
      return false;
    }

    return (
      (type === "node" && this.state.nodes?.includes(key)) ||
      (type === "edge" && this.state.edges?.includes(key))
    );
  }

  start(hovered: string, type: "node" | "edge", sigma: DALSigma) {
    const g = sigma.getGraph();
    const nodes =
      type === "node"
        ? [hovered, ...g.neighbors(hovered)]
        : [g.source(hovered), g.target(hovered)];
    const edges = type === "node" ? g.edges(hovered) : [hovered];

    this.state = {
      active: true,
      hovered,
      type,
      nodes,
      edges,
    };

    this.events.setActive(this.id);
    this.nodeReducers.setActive(this.id);
    this.edgeReducers.setActive(this.id);
    return { ...this.state };
  }

  stop() {
    const state = { ...this.state };
    this.state = {
      active: false,
    };

    this.events.setInactive(this.id);
    this.nodeReducers.setInactive(this.id);
    this.edgeReducers.setInactive(this.id);
    return state;
  }

  init(): Feature {
    const events = this.events;
    const reducers = {
      node: this.nodeReducers,
      edge: this.edgeReducers,
    };

    // Set hover state for nodes
    events.register(this.id, "enterNode", (sigma, payload) => {
      this.start(payload.node, "node", sigma);
    });

    // Set hover state for edges
    events.register(this.id, "enterEdge", (sigma, payload) => {
      this.start(payload.edge, "edge", sigma);
    });

    // Clear node or edge hover state
    const clearHover = (sigma: DALSigma) => {
      const oldState = this.stop();
      if (oldState.active && (oldState.nodes || oldState.edges)) {
        sigma.scheduleRefresh({
          partialGraph: {
            nodes: oldState.nodes,
            edges: oldState.edges,
          },
        });
      }
    };

    events.register(this.id, "leaveNode", clearHover);
    events.register(this.id, "leaveEdge", clearHover);

    // Show relevant edge labels and hide others
    reducers.edge.register(this.id, (edge, data, pooled) => {
      if (!this.state.active) {
        return pooled;
      }

      const thisEdgeHovered =
        this.state.type === "edge" && edge === this.state.hovered;
      const incidentNodeHovered = this.state.nodes?.includes(
        this.state.hovered
      );

      if (thisEdgeHovered || incidentNodeHovered) {
        pooled.label = pooled.label ?? data.label ?? null;
        pooled.forceLabel = true;
      } else {
        pooled.label = null;
      }

      return pooled;
    });

    // Show relevant node labels and hide others
    reducers.node.register(this.id, (node, _, pooled) => {
      if (!this.state.active) {
        return pooled;
      }

      const thisNodeHovered =
        this.state.type === "node" && node === this.state.hovered;
      const incidentEdgeOrAdjacentNodeHovered =
        this.state.nodes?.includes(node);
      if (thisNodeHovered || incidentEdgeOrAdjacentNodeHovered) {
        pooled.highlighted = true;
        pooled.forceLabel = true;
        return pooled;
      }

      return pooled;
    });

    return this;
  }
}
