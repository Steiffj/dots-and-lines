import type { DALSettings, DALSigma } from "../dal-types";
import type { FeatureRegistration } from "./types";

/**
 * @todo will want a utility to manage this for similar situations
 */
const originalSettings: Partial<DALSettings> = {};

const FEAT = Symbol("drag and drop");
export const FEAT_DRAG_AND_DROP = FEAT;
const featDragAndDrop: FeatureRegistration = (events, reducers) => {
  events.register(FEAT, "enterNode", (sigma) => {
    const state = sigma.getGraph().getAttribute("uiState");
    if (!state.drag.key) {
      sigma.getContainer().style.cursor = "grab";
    }
  });

  events.register(FEAT, "leaveNode", (sigma) => {
    const state = sigma.getGraph().getAttribute("uiState");
    if (!state.drag.key) {
      sigma.getContainer().style.cursor = "initial";
    }
  });

  // Start dragging
  events.register(FEAT, "downNode", (sigma, payload) => {
    sigma.getContainer().style.cursor = "grabbing";
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    state.dragStart(payload.node, g);
    if (!sigma.getCustomBBox()) {
      sigma.setCustomBBox(sigma.getBBox());
    }
  });

  // Update dragging position
  events.register(FEAT, "moveBody", (sigma, payload) => {
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    const draggedNode = state.drag.key;
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
    const draggedNode = state.drag.key;
    if (!draggedNode) {
      return;
    }

    sigma.setCustomBBox(null);
    const incident = state.dragEnd();

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
        nodes: [...incident.nodes, draggedNode],
        edges: [...incident.edges],
      },
    });
  };

  events.register(FEAT, "upNode", drop);
  events.register(FEAT, "upStage", drop);

  // Keep dragging node highlighted to prevent flashing during fast dragging
  reducers.node.register(FEAT, (node, _, pooled, sigma) => {
    let display = pooled ?? {};
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");

    const draggedNode = state.drag.key;
    if (!draggedNode) {
      return display;
    }

    if (draggedNode === node) {
      display.highlighted = true;
      display.forceLabel = true;
      return display;
    }

    const incident = state.drag.incident!;
    const maxVisibleAdjacentNodeLabels = 60; // TODO move to config somewhere
    if (
      incident.nodes.has(node) &&
      incident.nodes.size <= maxVisibleAdjacentNodeLabels
    ) {
      display.highlighted = true;
      display.forceLabel = true;
    } else {
      display.label = null;
      display.highlighted = false;
    }

    return display;
  });

  reducers.edge.register(FEAT, (edge, data, pooled, sigma) => {
    let display = pooled ?? {};
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    if (!state.drag.key) {
      return display;
    }

    const incident = state.drag.incident!;
    if (incident.edges.has(edge)) {
      display.label = display.label ?? data.label ?? null;
      display.forceLabel = true;
    } else {
      display.label = null;
    }

    return display;
  });

  return FEAT;
};

export default featDragAndDrop;
