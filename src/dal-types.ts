import type Graph from "graphology";
import type { Sigma } from "sigma";
import type { Settings } from "sigma/settings";
import type { EdgeDisplayData, NodeDisplayData } from "sigma/types";
import type { ColorPalette, SigmaRenderStyles } from "./color-scheme/types";
import type { EventState } from "./events/event-state";

export type DALSigma = Sigma<DALNodeAttrs, DALEdgeAttrs, DALGraphAttrs>;
export type DALGraph = Graph<DALNodeAttrs, DALEdgeAttrs, DALGraphAttrs>;

export type DALNodeAttrs = Partial<NodeDisplayData> & {
  cluster?: number;
};
export type DALEdgeAttrs = Partial<EdgeDisplayData>;
export type DALGraphAttrs = {
  uiState: EventState;
  styles: SigmaRenderStyles;
  palette?: ColorPalette;
};

export type DALSettings = Settings<DALNodeAttrs, DALEdgeAttrs, DALGraphAttrs>;
