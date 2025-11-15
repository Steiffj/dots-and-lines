import type { DALSettings, DALSigma } from "../dal-types";
import type { EventRegistry } from "../events/event.registry";
import type {
  EdgeReducerRegistry,
  NodeReducerRegistry,
} from "../reducers/reducer.registry";
import type { Feature, FeatureInit, FeatureState } from "./types";

/**
 * @todo will want a utility to manage this for similar situations
 */
const originalSettings: Partial<DALSettings> = {};

// TODO pick up here
type State = FeatureState &
  (
    | {
        active: true;
        dragging: string;
      }
    | {
        active: false;
        dragging?: undefined;
      }
  );

export class FeatDragAndDrop implements Feature, FeatureInit {
  readonly id = Symbol("drag and drop");
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
        "Drag and drop feature was provided inconsistent Sigma instances in registries."
      );
    }
  }

  #activeNotificationCallbacks: ((
    feat: symbol,
    state?: FeatureState
  ) => void)[] = [];
  onActivityChange(recipient: (feat: symbol, state?: FeatureState) => void) {
    if (!this.#activeNotificationCallbacks.includes(recipient)) {
      this.#activeNotificationCallbacks.push(recipient);
    }
  }

  private notify(state: FeatureState) {
    for (const recipient of this.#activeNotificationCallbacks) {
      recipient(this.id, state);
    }
  }

  start(dragging: string, sigma: DALSigma) {
    const g = sigma.getGraph();
    this.state = {
      active: true,
      dragging,
      nodes: [dragging, ...g.neighbors(dragging)],
      edges: g.edges(dragging),
    };

    this.events.setActive(this.id);
    this.nodeReducers.setActive(this.id);
    this.edgeReducers.setActive(this.id);
    const state = { ...this.state };
    this.notify(state);
    return state;
  }

  stop() {
    const state = { ...this.state };
    this.state = {
      active: false,
    };

    this.events.setInactive(this.id);
    this.nodeReducers.setInactive(this.id);
    this.edgeReducers.setInactive(this.id);
    this.notify({ ...this.state });
    return state;
  }

  init(): Feature {
    const events = this.events;
    const reducers = {
      node: this.nodeReducers,
      edge: this.edgeReducers,
    };

    events.register(this.id, "enterNode", (sigma) => {
      if (!this.state.active) {
        sigma.getContainer().style.cursor = "grab";
      }
    });

    events.register(this.id, "leaveNode", (sigma) => {
      if (!this.active) {
        sigma.getContainer().style.cursor = "initial";
      }
    });

    // Start dragging
    events.register(this.id, "downNode", (sigma, payload) => {
      sigma.getContainer().style.cursor = "grabbing";
      this.start(payload.node, sigma);
      if (!sigma.getCustomBBox()) {
        sigma.setCustomBBox(sigma.getBBox());
      }
    });

    // Update dragging position
    events.register(this.id, "moveBody", (sigma, payload) => {
      const g = sigma.getGraph();
      if (!this.state.active) {
        return;
      }

      // if (sigma.getSetting("renderLabels")) {
      //   originalSettings.renderLabels = true;
      //   sigma.setSetting("renderLabels", false);
      // }

      const pos = sigma.viewportToGraph(payload.event);
      g.setNodeAttribute(this.state.dragging, "x", pos.x);
      g.setNodeAttribute(this.state.dragging, "y", pos.y);

      payload.event.preventSigmaDefault();
      payload.event.original.preventDefault();
      payload.event.original.stopPropagation();
    });

    // Stop dragging node
    const drop = (sigma: DALSigma) => {
      if (!this.state.active) {
        return;
      }

      sigma.getContainer().style.cursor = "initial";
      sigma.setCustomBBox(null);
      const oldState = this.stop();

      // TODO refactor
      // if (
      //   originalSettings.renderEdgeLabels !== undefined &&
      //   sigma.getSetting("renderEdgeLabels") !== originalSettings.renderEdgeLabels
      // ) {
      //   sigma.setSetting("renderEdgeLabels", originalSettings.renderEdgeLabels);
      //   delete originalSettings.renderEdgeLabels;
      // }

      // if (
      //   originalSettings.renderLabels !== undefined &&
      //   sigma.getSetting("renderLabels") !== originalSettings.renderLabels
      // ) {
      //   sigma.setSetting("renderLabels", originalSettings.renderLabels);
      //   delete originalSettings.renderLabels;
      // }

      // TODO consolidate rendering refreshes in the feature registry
      if (oldState.active && (oldState.nodes || oldState.edges)) {
        sigma.scheduleRefresh({
          partialGraph: {
            nodes: oldState.nodes,
            edges: oldState.edges,
          },
        });
      }
    };

    events.register(this.id, "upNode", drop);
    events.register(this.id, "upStage", drop);

    // Keep dragging node highlighted to prevent flashing during fast dragging
    reducers.node.register(this.id, (node, _, pooled) => {
      if (!this.state.active) {
        return pooled;
      }

      if (this.state.dragging === node) {
        pooled.highlighted = true;
        pooled.forceLabel = true;
        return pooled;
      }

      const { nodes } = this.state;
      const maxVisibleAdjacentNodeLabels = 60; // TODO move to config somewhere
      if (
        nodes?.includes(node) &&
        nodes?.length <= maxVisibleAdjacentNodeLabels
      ) {
        pooled.highlighted = true;
        pooled.forceLabel = true;
      } else {
        pooled.label = null;
        pooled.highlighted = false;
      }

      return pooled;
    });

    reducers.edge.register(this.id, (edge, data, pooled) => {
      if (!this.state.active) {
        return pooled;
      }

      const { edges } = this.state;
      if (edges?.includes(edge)) {
        pooled.label = pooled.label ?? data.label ?? null;
        pooled.forceLabel = true;
      } else {
        pooled.label = null;
      }

      return pooled;
    });

    return this;
  }
}
