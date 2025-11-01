import type Graph from "graphology";
import type { Sigma } from "sigma";
import type { EdgeDisplayData, NodeDisplayData } from "sigma/types";
import type { ColorPalette } from "./palettes";

export type DALSigma = Sigma<DALNodeAttrs, DALEdgeAttrs, DALGraphAttrs>;

export type DALNodeAttrs = Partial<NodeDisplayData> & {
  cluster?: number;
};
export type DALEdgeAttrs = Partial<EdgeDisplayData>;
export type DALGraphAttrs = {
  theme?: "dark" | "light";
  text?: string;
  palette?: ColorPalette;
};

export type DALGraph = Graph<DALNodeAttrs, DALEdgeAttrs, DALGraphAttrs>;
