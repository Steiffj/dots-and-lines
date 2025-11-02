import type { Attributes } from "graphology-types";
import type { Sigma } from "sigma";
import type { DisplayData, NodeDisplayData } from "sigma/types";

export type PooledNodeReducer<
  N extends Attributes,
  E extends Attributes,
  A extends Attributes
> = (
  node: string,
  data: N,
  pooled: Partial<NodeDisplayData> | undefined,
  sigma: Sigma<N, E, A>
) => Partial<NodeDisplayData>;

export type PooledEdgeReducer<
  N extends Attributes,
  E extends Attributes,
  A extends Attributes
> = (
  edge: string,
  data: E,
  pooled: Partial<DisplayData> | undefined,
  sigma: Sigma<N, E, A>
) => Partial<DisplayData>;
