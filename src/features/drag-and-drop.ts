import type { DALSettings, DALSigma } from "../dal-types";
import type { FeatureRegistration } from "./types";

/**
 * @todo will want a utility to manage this for similar situations
 */
const originalSettings: Partial<DALSettings> = {};

const featDragAndDrop: FeatureRegistration = (events, reducers) => {
  events.register("enterNode", (sigma) => {
    const state = sigma.getGraph().getAttribute("uiState");
    if (!state.dragging) {
      sigma.getContainer().style.cursor = "grab";
    }
  });

  events.register("leaveNode", (sigma) => {
    const state = sigma.getGraph().getAttribute("uiState");
    if (!state.dragging) {
      sigma.getContainer().style.cursor = "initial";
    }
  });

  // Start dragging
  events.register("downNode", (sigma, payload) => {
    sigma.getContainer().style.cursor = "grabbing";
    const state = sigma.getGraph().getAttribute("uiState");
    state.dragStart(payload.node);
    if (!sigma.getCustomBBox()) {
      sigma.setCustomBBox(sigma.getBBox());
    }
  });

  // Update dragging position
  events.register("moveBody", (sigma, payload) => {
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    const draggedNode = state.dragging;
    if (!draggedNode) {
      return;
    }

    // if (sigma.getSetting("renderEdgeLabels")) {
    //   originalSettings.renderEdgeLabels = true;
    //   sigma.setSetting("renderEdgeLabels", false);
    // }

    if (sigma.getSetting("renderLabels")) {
      originalSettings.renderLabels = true;
      sigma.setSetting("renderLabels", false);
    }

    const pos = sigma.viewportToGraph(payload.event);
    g.setNodeAttribute(draggedNode, "x", pos.x);
    g.setNodeAttribute(draggedNode, "y", pos.y);

    payload.event.preventSigmaDefault();
    payload.event.original.preventDefault();
    payload.event.original.stopPropagation();
  });

  // Stop dragging node
  const drop = (sigma: DALSigma) => {
    sigma.getContainer().style.cursor = "initial";
    const state = sigma.getGraph().getAttribute("uiState");
    const draggedNode = state.dragging;
    if (!draggedNode) {
      return;
    }

    sigma.setCustomBBox(null);
    state.dragEnd();

    // TODO refactor
    // if (
    //   originalSettings.renderEdgeLabels !== undefined &&
    //   sigma.getSetting("renderEdgeLabels") !== originalSettings.renderEdgeLabels
    // ) {
    //   sigma.setSetting("renderEdgeLabels", originalSettings.renderEdgeLabels);
    //   delete originalSettings.renderEdgeLabels;
    // }

    if (
      originalSettings.renderLabels !== undefined &&
      sigma.getSetting("renderLabels") !== originalSettings.renderLabels
    ) {
      sigma.setSetting("renderLabels", originalSettings.renderLabels);
      delete originalSettings.renderLabels;
    }

    sigma.scheduleRefresh({
      partialGraph: {
        nodes: [draggedNode],
      },
    });
  };

  events.register("upNode", drop);
  events.register("upStage", drop);

  // Keep dragging node highlighted to prevent flashing during fast dragging
  reducers.node.register((node, _, pooled, sigma) => {
    let display = pooled ?? {};
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");

    const draggedNode = state.dragging;
    if (!draggedNode) {
      return display;
    }

    if (draggedNode === node) {
      display.highlighted = true;
      display.forceLabel = true;
      return display;
    }

    const neighbors = g.neighbors(state.dragging);
    if (neighbors.includes(node)) {
      display.highlighted = true;
      display.forceLabel = true;
    } else {
      display.label = undefined;
      display.highlighted = false;
    }

    return display;
  });

  reducers.edge.register((edge, data, pooled, sigma) => {
    let display = pooled ?? {};
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    if (!state.dragging) {
      return display;
    }

    if (
      g.source(edge) === state.dragging ||
      g.target(edge) === state.dragging
    ) {
      display.label = display.label ?? data.label;
      display.forceLabel = true;
    } else {
      display.label = undefined;
      // display.hidden = true;
    }

    return display;
  });
};

export default featDragAndDrop;
