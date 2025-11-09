import type { Attributes } from "graphology-types";
import type { Sigma } from "sigma";
import type { DisplayData, NodeDisplayData } from "sigma/types";
import type { PooledReducer } from "./types";
import type { DALNodeAttrs, DALEdgeAttrs, DALGraphAttrs } from "../dal-types";

export type NodeReducerRegistry = ReducerRegistry<
  DALNodeAttrs,
  DALEdgeAttrs,
  DALGraphAttrs,
  NodeDisplayData,
  DALNodeAttrs
>;

export type EdgeReducerRegistry = ReducerRegistry<
  DALNodeAttrs,
  DALEdgeAttrs,
  DALGraphAttrs,
  DisplayData,
  DALEdgeAttrs
>;

/**
 * Dynamically manage multiple Sigma reducer functions, grouped by features.
 */
export class ReducerRegistry<
  N extends Attributes,
  E extends Attributes,
  A extends Attributes,
  R extends Partial<DisplayData>,
  D extends N | E
> {
  private readonly pool: Map<string, Partial<R>> = new Map();
  #reducers: PooledReducer<N, E, A, R, D>[] = [];
  #features: Map<PooledReducer<N, E, A, R, D>, symbol> = new Map();

  constructor(public readonly sigma: Sigma<N, E, A>) {}

  reducer = (key: string, data: D): R => {
    let pooled = this.pool.get(key) ?? {};
    for (const reducer of this.#reducers) {
      const displayData = reducer(key, data, pooled as R, this.sigma);
      if (displayData !== pooled) {
        throw new Error(
          "Reducers must mutate the pooled display data rather than create a new object."
        );
      }
      pooled = displayData; // TODO this is redundant if things work as expected
    }

    if (!pooled) {
      throw new Error("Pooled display data was not initialized!");
    }

    this.pool.set(key, pooled);
    return pooled as R;
  };

  /**
   * Clear all cached display data in the registry's internal object pool.
   */
  clear() {
    this.pool.clear();
  }

  /**
   * Register a reducer function as a part of a specified feature.
   * @param feature feature to which the reducer belongs
   * @param reducer display reducer function
   */
  register(feature: symbol, reducer: PooledReducer<N, E, A, R, D>) {
    if (!this.#reducers.includes(reducer)) {
      this.#reducers.push(reducer);
      this.#features.set(reducer, feature);
    }
  }

  /**
   * Remove a reducer function from the registry.
   * @param reducer display reducer function to remove
   */
  unregister(reducer: PooledReducer<N, E, A, R, D>) {
    const i = this.#reducers.indexOf(reducer);
    if (i >= 0) {
      this.#reducers.splice(i, 1);
      this.#features.delete(reducer);
    }
  }

  /**
   * Remove all reducers associated with a specified feature from the registry.
   * @param feature feature to remove
   */
  unregisterFeature(feature: symbol) {
    const reducers: PooledReducer<N, E, A, R, D>[] = [];
    for (const [reducer, feat] of this.#features) {
      if (feat === feature) {
        reducers.push(reducer);
      }
    }
    for (const reducer of reducers) {
      this.unregister(reducer);
    }
  }
}
