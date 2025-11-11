import type { Attributes } from "graphology-types";
import type { Sigma } from "sigma";
import type { DisplayData, NodeDisplayData } from "sigma/types";
import type { DALEdgeAttrs, DALGraphAttrs, DALNodeAttrs } from "../dal-types";
import type { PooledReducer } from "./types";
import { FeatureActivityManager } from "../features/feature-activity-manager";

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
  #pausedReducers: PooledReducer<N, E, A, R, D>[] = [];
  #pausedFeatures: symbol[] = [];
  #activityMgr = new FeatureActivityManager();

  configure(active: symbol, disabled: symbol) {
    this.#activityMgr.configure([active, disabled]);
  }

  setActive(feature: symbol) {
    this.#activityMgr.pushActive(feature);
  }

  setInactive(feature: symbol) {
    this.#activityMgr.removeActive(feature);
  }

  isDisabled(reducer: PooledReducer<N, E, A, R, D>) {
    const feat = this.#features.get(reducer);
    if (!feat) {
      throw new Error(
        `Missing listener/feature mapping for feature ${String(
          feat
        )} in reducer registry`
      );
    }

    return this.#activityMgr.isDisabled(feat);
  }

  private shouldSkip(reducer: PooledReducer<N, E, A, R, D>) {
    return this.isPaused(reducer) || this.isDisabled(reducer);
  }

  constructor(public readonly sigma: Sigma<N, E, A>) {}

  reducer = (key: string, data: D): R => {
    let pooled = this.pool.get(key) ?? {};
    for (const reducer of this.#reducers) {
      if (this.shouldSkip(reducer)) {
        continue;
      }
      const displayData = reducer(key, data, pooled as R, this.sigma);
      if (displayData !== pooled) {
        throw new Error(
          "Reducers must mutate the pooled display data rather than create a new object."
        );
      }
    }

    if (!pooled || Object.keys(pooled).length === 0) {
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

  /**
   * Temporarily stop an event listener or entire feature from executing.
   * This method does nothing if the provided listener/feature was already paused.
   *
   * @param reducerOrFeature listener/feature to pause
   */
  pause(reducerOrFeature: PooledReducer<N, E, A, R, D> | symbol) {
    if (
      typeof reducerOrFeature === "symbol" &&
      !this.#pausedFeatures.includes(reducerOrFeature)
    ) {
      this.#pausedFeatures.push(reducerOrFeature);
    } else if (
      typeof reducerOrFeature === "function" &&
      !this.#pausedReducers.includes(reducerOrFeature)
    ) {
      this.#pausedReducers.push(reducerOrFeature);
    }
  }

  /**
   * Resume an event listener's or feature's normal execution.
   * This method does nothing if the provided listener/feature was not paused.
   *
   * @param reducerOrFeature listener/feature to resume
   */
  resume(reducerOrFeature: PooledReducer<N, E, A, R, D> | symbol) {
    let i: number;
    if (
      typeof reducerOrFeature === "symbol" &&
      (i = this.#pausedFeatures.indexOf(reducerOrFeature)) > -1
    ) {
      this.#pausedFeatures.splice(i, 1);
    } else if (
      typeof reducerOrFeature === "function" &&
      (i = this.#pausedReducers.indexOf(reducerOrFeature)) > -1
    ) {
      this.#pausedReducers.splice(i, 1);
    }
  }

  /**
   * Check whether an event listener is currently paused.
   *
   * @param reducer event listener to check
   * @returns true if the listener is paused
   */
  isPaused(reducer: PooledReducer<N, E, A, R, D>) {
    return (
      this.#pausedReducers.includes(reducer) ||
      this.#pausedFeatures.includes(this.#features.get(reducer)!)
    );
  }
}
