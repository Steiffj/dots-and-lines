/**
 * @todo handle:
 * - Feature activity start/end methods
 * - Stop putting feature state directly in Sigma's graph
 * - Pass feature state to events and reducers
 * - Pass feature settings manager events and reducers
 */
export type FeatureState =
  | {
      active: false;
    }
  | {
      active: true;
      refresh?: boolean;
      nodes?: string[];
      edges?: string[];
    };

export interface Feature {
  readonly id: symbol;
  readonly state: FeatureState;
  readonly active: boolean;
}

export interface FeatureInit {
  init(): Feature;
}
