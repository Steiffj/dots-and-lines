import type { FeatureDefinition } from "./types";

const FEAT = Symbol("hover legibility");
export const FEAT_HOVER_LEGIBILITY = FEAT;
const featHoverLegibility: FeatureDefinition = (events, reducers) => {
  // Set hover state for nodes
  events.register(FEAT, "enterNode", (sigma, payload) => {
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    state.hoverStart(payload.node, "node", g);
  });

  // Set hover state for edges
  events.register(FEAT, "enterEdge", (sigma, payload) => {
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    state.hoverStart(payload.edge, "edge", g);
  });

  // Clear hover state for nodes
  events.register(FEAT, "leaveNode", (sigma, payload) => {
    const state = sigma.getGraph().getAttribute("uiState");
    const incident = state.hoverEnd();
    sigma.scheduleRefresh({
      partialGraph: {
        nodes: [...incident.nodes, payload.node],
        edges: [...incident.edges],
      },
    });
  });

  // Clear hover state for edges
  events.register(FEAT, "leaveEdge", (sigma, payload) => {
    const state = sigma.getGraph().getAttribute("uiState");
    const incident = state.hoverEnd();
    if (incident) {
      sigma.scheduleRefresh({
        partialGraph: {
          nodes: [...incident.nodes],
          edges: [...incident.edges, payload.edge],
        },
      });
    }
  });

  // Show relevant edge labels and hide others
  reducers.edge.register(FEAT, (edge, data, pooled, sigma) => {
    let display = pooled ?? {};
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    const hovered = state.hovered;
    if (!hovered.key) {
      return display;
    }

    const incident = hovered.incident!;
    const thisEdgeHovered = hovered.type === "edge" && edge === hovered.key;
    const incidentNodeHovered = incident.nodes.has(hovered.key);
    if (thisEdgeHovered || incidentNodeHovered) {
      display.label = display.label ?? data.label ?? null;
      display.forceLabel = true;
    } else {
      display.label = null;
    }

    return display;
  });

  // Show relevant node labels and hide others
  reducers.node.register(FEAT, (node, _, pooled, sigma) => {
    let display = pooled ?? {};
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    const hovered = state.hovered;
    if (!hovered.key) {
      return display;
    }

    const incident = hovered.incident!;
    const thisNodeHovered = hovered.type === "node" && node === hovered.key;
    const incidentEdgeHovered = incident.nodes.has(node);
    if (thisNodeHovered || incidentEdgeHovered) {
      display.highlighted = true;
      display.forceLabel = true;
      return display;
    }

    if (hovered.type !== "node") {
      return display;
    }

    const neighbors = g.neighbors(hovered.key);
    if (neighbors.includes(node)) {
      display.highlighted = true;
      display.forceLabel = true;
    }

    return display;
  });

  return FEAT;
};

export default featHoverLegibility;
