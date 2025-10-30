import EdgeCurveProgram from "@sigma/edge-curve";
import { NodeSquareProgram } from "@sigma/node-square";
import type Graph from "graphology";
import { Sigma } from "sigma";
import {
  DEFAULT_NODE_PROGRAM_CLASSES,
  DEFAULT_EDGE_PROGRAM_CLASSES,
  type Settings,
} from "sigma/settings";
import chroma from "chroma-js";

let sigma: Sigma;
const THEME_CONFIG = {
  node: () =>
    getComputedStyle(
      document.getElementById("vis-color-node-default") as HTMLElement
    ).backgroundColor,
  edge: () =>
    getComputedStyle(
      document.getElementById("vis-color-edge-default") as HTMLElement
    ).backgroundColor,
  text: () =>
    getComputedStyle(
      document.getElementById("vis-color-text-default") as HTMLElement
    ).backgroundColor,
};

export function setupSigma(
  graph: Graph,
  container: HTMLElement,
  settings: Partial<Settings>
) {
  const nodeColor = THEME_CONFIG.node();
  const edgeColor = THEME_CONFIG.edge();
  const textColor = THEME_CONFIG.text();
  const nodeRGB = chroma(nodeColor).hex("rgb");
  const edgeRGB = chroma(edgeColor).hex("rgb");

  const renderer = new Sigma(graph, container, {
    ...settings,
    nodeProgramClasses: {
      ...DEFAULT_NODE_PROGRAM_CLASSES,
      square: NodeSquareProgram,
    },
    edgeProgramClasses: {
      ...DEFAULT_EDGE_PROGRAM_CLASSES,
      curve: EdgeCurveProgram,
    },
    defaultNodeColor: nodeRGB,
    defaultEdgeColor: edgeRGB,
    labelColor: { color: textColor },
    edgeLabelColor: { color: textColor },
  });

  sigma = renderer;
  return renderer;
}

export function sigmaDarkModeToggle() {
  if (!sigma) {
    throw new Error("Sigma was not initialized at time of dark mode toggle");
  }

  const nodeColor = THEME_CONFIG.node();
  const edgeColor = THEME_CONFIG.edge();
  const textColor = THEME_CONFIG.text();
  const nodeRGB = chroma(nodeColor).hex("rgb");
  const edgeRGB = chroma(edgeColor).hex("rgb");
  sigma.setSetting("defaultNodeColor", nodeRGB);
  sigma.setSetting("defaultEdgeColor", edgeRGB);
  sigma.setSetting("labelColor", {
    color: textColor,
  });
  sigma.setSetting("edgeLabelColor", {
    color: textColor,
  });
}
