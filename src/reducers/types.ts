import type { Attributes } from "graphology-types";
import type { Sigma } from "sigma";
import type { DisplayData, NodeDisplayData } from "sigma/types";

export type PooledNodeReducer<
  N extends Attributes,
  E extends Attributes,
  A extends Attributes
> = PooledReducer<N, E, A, Partial<NodeDisplayData>, N>;

export type PooledEdgeReducer<
  N extends Attributes,
  E extends Attributes,
  A extends Attributes
> = PooledReducer<N, E, A, Partial<DisplayData>, E>;

export type PooledReducer<
  N extends Attributes,
  E extends Attributes,
  A extends Attributes,
  R extends Partial<DisplayData>,
  D extends N | E
> = (key: string, data: D, pooled: R, sigma: Sigma<N, E, A>) => Partial<R>;
