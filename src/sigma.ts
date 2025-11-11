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
import { EventRegistry } from "./events/event.registry";
import { FeatCore } from "./features/core.feat";
import { FeatDragAndDrop } from "./features/drag-and-drop.feat";
import { FeatHoverLegibility } from "./features/hover-legibility.feat";
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
  const featCore = new FeatCore(nodeReducerRegistry, edgeReducerRegistry);
  featCore.init();

  const nodeRenderer = new DefaultNodeLabelRenderer(sigma);
  sigma.setSetting("defaultDrawNodeLabel", nodeRenderer.drawLabel);
  sigma.setSetting("defaultDrawNodeHover", nodeRenderer.drawHover);

  const edgeRenderer = new DefaultEdgeLabelRenderer(sigma);
  sigma.setSetting("defaultDrawEdgeLabel", edgeRenderer.drawStraightEdgeLabel);

  sigma.setSetting("nodeReducer", nodeReducerRegistry.reducer);
  sigma.setSetting("edgeReducer", edgeReducerRegistry.reducer);

  const featHoverLegibility = new FeatHoverLegibility(
    eventRegistry,
    nodeReducerRegistry,
    edgeReducerRegistry
  );
  featHoverLegibility.init();

  const featDragAndDrop = new FeatDragAndDrop(
    eventRegistry,
    nodeReducerRegistry,
    edgeReducerRegistry
  );
  featDragAndDrop.init();

  // TODO name 'configure' something more meaningful
  eventRegistry.configure(featDragAndDrop.id, featHoverLegibility.id);
  nodeReducerRegistry.configure(featDragAndDrop.id, featHoverLegibility.id);
  edgeReducerRegistry.configure(featDragAndDrop.id, featHoverLegibility.id);

  return sigma;
}
