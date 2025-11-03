import type { DALSigma } from "../dal-types";
import type { FeatureRegistration } from "./types";

const featDragAndDrop: FeatureRegistration = (events, reducers) => {
  // Start dragging
  events.register("downNode", (sigma, payload) => {
    const state = sigma.getGraph().getAttribute("uiState");
    state.dragStart(payload.node);
    if (!sigma.getCustomBBox()) {
      sigma.setCustomBBox(sigma.getBBox());
    }
  });

  // TODO not working as-is; check what Sigma is doing with its default renderers/event handling

  // events.register("enterNode", (sigma, payload) => {
  //   const state = sigma.getGraph().getAttribute("uiState");
  //   if (state.dragging) {
  //     payload.preventSigmaDefault();
  //     payload.event.original.preventDefault();
  //     payload.event.original.stopPropagation();
  //   }
  // });

  // Update dragging position
  events.register("moveBody", (sigma, payload) => {
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

  events.register("upNode", drop);
  events.register("upStage", drop);

  // Keep dragging node highlighted to prevent flashing during fast dragging
  reducers.node.register((node, _, pooled, sigma) => {
    let display = pooled ?? {};
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    if (state.dragging === node) {
      display.highlighted = true;
    }
    // else if (state.dragging && state.dragging !== node) {
    //   display.highlighted = false;
    // }
    return display;
  });
};

export default featDragAndDrop;
