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

/**
 * Dynamically manages multiple node reducer functions for Sigma.
 * The reducer system extends Sigma's default capabilities by providing the Sigma instance (and by extension, its underlying graph).
 *
 * Leverages object pooling to minimize garbage collection related to display data objects used in Sigma's rendering lifecycle.
 */
export class NodeReducerConductor<
  N extends Attributes,
  E extends Attributes,
  A extends Attributes
> {
  private readonly pool: Map<string, Partial<NodeDisplayData>> = new Map();
  #reducers: PooledNodeReducer<N, E, A>[] = [];

  constructor(public readonly sigma: Sigma<N, E, A>) {
    // TODO need to handle Sigma's entire graph instance being replaced - that will leave this logic with an orphaned graph
    // Define custom event type on Sigma to capture graph instance being replaced? https://www.sigmajs.org/docs/advanced/events
    sigma.once("kill", () => {
      this.clear();
    });

    const g = this.sigma.getGraph();
    g.on("cleared", () => {
      this.clear();
    });
    g.on("nodeDropped", ({ key }) => {
      this.pool.delete(key);
    });
  }

  reducer = (node: string, data: N): Partial<NodeDisplayData> => {
    let pooled = this.pool.get(node);
    for (const reducer of this.#reducers) {
      const displayData = reducer(node, data, pooled, this.sigma);
      if (pooled && displayData !== pooled) {
        throw new Error(
          "Reducers must mutate the pooled display data rather than create a new object."
        );
      }
      pooled = displayData; // TODO this is redundant if things work as expected
    }

    if (!pooled) {
      throw new Error("Pooled display data was not initialized!");
    }

    this.pool.set(node, pooled);
    return pooled;
  };

  /**
   * Clear all cached display data in the conductor's internal object pool.
   */
  clear() {
    this.pool.clear();
  }

  register(reducer: PooledNodeReducer<N, E, A>) {
    if (!this.#reducers.includes(reducer)) {
      this.#reducers.push(reducer);
    }
  }

  unregister(reducer: PooledNodeReducer<N, E, A>) {
    const i = this.#reducers.indexOf(reducer);
    if (i >= 0) {
      this.#reducers.splice(i, 1);
    }
  }
}

/**
 * Dynamically manages multiple edge reducer functions for Sigma.
 * The system extends Sigma's default capabilities by providing the Sigma renderer (and by extension, its underlying graph) to reducers.
 *
 * Leverages object pooling to minimize garbage collection related to display data objects used in Sigma's rendering lifecycle.
 */
export class EdgeReducerConductor<
  N extends Attributes,
  E extends Attributes,
  A extends Attributes
> {
  private readonly pool: Map<string, Partial<DisplayData>> = new Map();
  #reducers: PooledEdgeReducer<N, E, A>[] = [];

  constructor(public readonly sigma: Sigma<N, E, A>) {
    // TODO need to handle Sigma's entire graph instance being replaced - that will leave this logic with an orphaned graph
    // Define custom event type on Sigma to capture graph instance being replaced? https://www.sigmajs.org/docs/advanced/events
    sigma.once("kill", () => {
      this.clear();
    });

    const g = this.sigma.getGraph();
    g.on("cleared", () => {
      this.clear();
    });
    g.on("edgesCleared", () => {
      this.clear();
    });
    g.on("edgeDropped", ({ key }) => {
      this.pool.delete(key);
    });
  }

  reducer = (edge: string, data: E): Partial<DisplayData> => {
    let pooled = this.pool.get(edge);
    for (const reducer of this.#reducers) {
      const displayData = reducer(edge, data, pooled, this.sigma);
      if (pooled && displayData !== pooled) {
        throw new Error(
          "Reducers must mutate the pooled display data rather than create a new object."
        );
      }
      pooled = displayData; // TODO this is redundant if things work as expected
    }

    if (!pooled) {
      throw new Error("Pooled display data was not initialized!");
    }

    this.pool.set(edge, pooled);
    return pooled;
  };

  /**
   * Clear all cached display data in the conductor's internal object pool.
   */
  clear() {
    this.pool.clear();
  }

  register(reducer: PooledEdgeReducer<N, E, A>) {
    if (!this.#reducers.includes(reducer)) {
      this.#reducers.push(reducer);
    }
  }

  unregister(reducer: PooledEdgeReducer<N, E, A>) {
    const i = this.#reducers.indexOf(reducer);
    if (i >= 0) {
      this.#reducers.splice(i, 1);
    }
  }
}
