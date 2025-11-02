import type { DALSigma } from "../dal-types";
import { EventRegistry } from "./event.registry";

export function setupDragAndDrop(orch: EventRegistry) {
  // Start dragging
  orch.register("downNode", (sigma, payload) => {
    const state = sigma.getGraph().getAttribute("uiState");
    state.dragStart(payload.node);
    if (!sigma.getCustomBBox()) {
      sigma.setCustomBBox(sigma.getBBox());
    }
  });

  // Update dragging position
  orch.register("moveBody", (sigma, payload) => {
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    const node = state.dragging;
    if (!node) {
      return;
    }

    const pos = sigma.viewportToGraph(payload.event);
    g.setNodeAttribute(node, "x", pos.x);
    g.setNodeAttribute(node, "y", pos.y);

    payload.event.preventSigmaDefault();
    payload.event.original.preventDefault();
    payload.event.original.stopPropagation();
  });

  // Stop dragging node
  const drop = (sigma: DALSigma) => {
    const state = sigma.getGraph().getAttribute("uiState");
    const draggedNode = state.dragging;
    if (draggedNode) {
      sigma.setCustomBBox(null);
      state.dragEnd();
      sigma.scheduleRefresh({
        partialGraph: {
          nodes: [draggedNode],
        },
      });
    }
  };

  orch.register("upNode", drop);
  orch.register("upStage", drop);
}
