import EdgeCurveProgram from "@sigma/edge-curve";
import { NodeSquareProgram } from "@sigma/node-square";
import { Sigma } from "sigma";
import {
  DEFAULT_EDGE_PROGRAM_CLASSES,
  DEFAULT_NODE_PROGRAM_CLASSES,
  type Settings,
} from "sigma/settings";
import { registerColorSchemeToggleHandler } from "./color-scheme/color-scheme-sync";
import { syncSigmaColorScheme } from "./color-scheme/sigma-sync";
import type {
  DALEdgeAttrs,
  DALGraph,
  DALGraphAttrs,
  DALNodeAttrs,
  DALSigma,
} from "./dal-types";
import { EventState } from "./events/event-state";
import { EventRegistry } from "./events/event.registry";
import featCore from "./features/core.feat";
import featDragAndDrop from "./features/drag-and-drop.feat";
import featHoverLegibility from "./features/hover-legibility.feat";
import {
  ReducerRegistry,
  type EdgeReducerRegistry,
  type NodeReducerRegistry,
} from "./reducers/reducer.registry";
import { DefaultEdgeLabelRenderer } from "./rendering/default-edge";
import { DefaultNodeLabelRenderer } from "./rendering/default-node";

let sigma: DALSigma;

export function setupSigma(
  graph: DALGraph,
  container: HTMLElement,
  settings: Partial<Settings>
) {
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
    }
  );

  sigma = renderer;

  syncSigmaColorScheme(sigma);
  registerColorSchemeToggleHandler(() => syncSigmaColorScheme(sigma));

  const eventRegistry = new EventRegistry(sigma);
  const nodeReducerRegistry: NodeReducerRegistry = new ReducerRegistry(sigma);
  const edgeReducerRegistry: EdgeReducerRegistry = new ReducerRegistry(sigma);

  /**
   * Core features must be initialized before setting Sigma's node/edge reducers,
   * otherwise object pool and event state won't be available.
   */
  featCore(eventRegistry, {
    node: nodeReducerRegistry,
    edge: edgeReducerRegistry,
  });

  const nodeRenderer = new DefaultNodeLabelRenderer(sigma);
  sigma.setSetting("defaultDrawNodeLabel", nodeRenderer.drawLabel);
  sigma.setSetting("defaultDrawNodeHover", nodeRenderer.drawHover);

  const edgeRenderer = new DefaultEdgeLabelRenderer(sigma);
  sigma.setSetting("defaultDrawEdgeLabel", edgeRenderer.drawStraightEdgeLabel);

  sigma.setSetting("nodeReducer", nodeReducerRegistry.reducer);
  sigma.setSetting("edgeReducer", edgeReducerRegistry.reducer);

  featHoverLegibility(eventRegistry, {
    node: nodeReducerRegistry,
    edge: edgeReducerRegistry,
  });
  featDragAndDrop(eventRegistry, {
    node: nodeReducerRegistry,
    edge: edgeReducerRegistry,
  });

  return sigma;
}

// export function sigmaDarkModeToggle() {
//   if (!sigma) {
//     throw new Error("Sigma was not initialized at time of dark mode toggle");
//   }
//   if (!host) {
//     throw new Error(
//       "Sigma container was not initialized at time of dark mode toggle"
//     );
//   }

//   const nodeColor = THEME_CONFIG.node();
//   const edgeColor = THEME_CONFIG.edge();
//   const textColor = THEME_CONFIG.text();
//   // WebGL rendering (I think?) does not like Oklab color spaces - convert to RGB
//   const nodeRGB = chroma(nodeColor).hex("rgb");
//   const edgeRGB = chroma(edgeColor).hex("rgb");
//   sigma.setSetting("defaultNodeColor", nodeRGB);
//   sigma.setSetting("defaultEdgeColor", edgeRGB);
//   sigma.setSetting("labelColor", {
//     color: textColor,
//   });
//   sigma.setSetting("edgeLabelColor", {
//     color: textColor,
//   });

//   // const g = sigma.getGraph();
//   // g.setAttribute("text", textColor);
// }
