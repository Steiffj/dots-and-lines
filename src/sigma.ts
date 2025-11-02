import EdgeCurveProgram from "@sigma/edge-curve";
import { NodeSquareProgram } from "@sigma/node-square";
import chroma from "chroma-js";
import { Sigma } from "sigma";
import {
  DEFAULT_EDGE_PROGRAM_CLASSES,
  DEFAULT_NODE_PROGRAM_CLASSES,
  type Settings,
} from "sigma/settings";
import {
  EdgeReducerRegistry,
  NodeReducerRegistry,
} from "./reducers/reducer.registry";
import {
  defaultEdgeLabels,
  edgePaletteReducer,
  edgeReducerCommon,
} from "./reducers/edge-reducers";
import { nodeReducerCommon } from "./reducers/node-reducers";
import type {
  DALSigma,
  DALEdgeAttrs,
  DALGraphAttrs,
  DALNodeAttrs,
  DALGraph,
} from "./dal-types";
import { EventRegistry } from "./events/event.registry";
import featDragAndDrop from "./features/drag-and-drop";
import { EventState } from "./events/event-state";

let host: HTMLElement;
let sigma: DALSigma;
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
  graph: DALGraph,
  container: HTMLElement,
  settings: Partial<Settings>
) {
  const nodeColor = THEME_CONFIG.node();
  const edgeColor = THEME_CONFIG.edge();
  const textColor = THEME_CONFIG.text();
  const nodeRGB = chroma(nodeColor).hex("rgb");
  const edgeRGB = chroma(edgeColor).hex("rgb");

  graph.setAttribute("uiState", new EventState());
  const renderer = new Sigma<DALNodeAttrs, DALEdgeAttrs, DALGraphAttrs>(
    graph,
    container,
    {
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
      renderEdgeLabels: true,
    }
  );

  sigma = renderer;
  host = container;

  const eventRegistry = new EventRegistry(sigma);
  const nodeReducerRegistry = new NodeReducerRegistry(sigma);
  const edgeReducerRegistry = new EdgeReducerRegistry(sigma);
  sigma.setSetting("nodeReducer", nodeReducerRegistry.reducer);
  sigma.setSetting("edgeReducer", edgeReducerRegistry.reducer);

  nodeReducerRegistry.register(nodeReducerCommon);
  edgeReducerRegistry.register(edgeReducerCommon);
  edgeReducerRegistry.register(edgePaletteReducer);
  edgeReducerRegistry.register(defaultEdgeLabels);

  featDragAndDrop(eventRegistry, {
    node: nodeReducerRegistry,
    edge: edgeReducerRegistry,
  });

  return sigma;
}

export function sigmaDarkModeToggle() {
  if (!sigma) {
    throw new Error("Sigma was not initialized at time of dark mode toggle");
  }
  if (!host) {
    throw new Error(
      "Sigma container was not initialized at time of dark mode toggle"
    );
  }

  const nodeColor = THEME_CONFIG.node();
  const edgeColor = THEME_CONFIG.edge();
  const textColor = THEME_CONFIG.text();
  // WebGL rendering (I think?) does not like Oklab color spaces - convert to RGB
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

  const g = sigma.getGraph();
  g.setAttribute("text", textColor);
}
