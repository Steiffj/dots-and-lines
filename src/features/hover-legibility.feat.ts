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
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    const hovered = state.hovered;
    if (!hovered.key) {
      return pooled;
    }

    const incident = hovered.incident!;
    const thisEdgeHovered = hovered.type === "edge" && edge === hovered.key;
    const incidentNodeHovered = incident.nodes.has(hovered.key);
    if (thisEdgeHovered || incidentNodeHovered) {
      pooled.label = pooled.label ?? data.label ?? null;
      pooled.forceLabel = true;
    } else {
      pooled.label = null;
    }

    return pooled;
  });

  // Show relevant node labels and hide others
  reducers.node.register(FEAT, (node, _, pooled, sigma) => {
    const g = sigma.getGraph();
    const state = g.getAttribute("uiState");
    const hovered = state.hovered;
    if (!hovered.key) {
      return pooled;
    }

    const incident = hovered.incident!;
    const thisNodeHovered = hovered.type === "node" && node === hovered.key;
    const incidentEdgeHovered = incident.nodes.has(node);
    if (thisNodeHovered || incidentEdgeHovered) {
      pooled.highlighted = true;
      pooled.forceLabel = true;
      return pooled;
    }

    if (hovered.type !== "node") {
      return pooled;
    }

    const neighbors = g.neighbors(hovered.key);
    if (neighbors.includes(node)) {
      pooled.highlighted = true;
      pooled.forceLabel = true;
    }

    return pooled;
  });

  return FEAT;
};

export default featHoverLegibility;
