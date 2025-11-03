import type { Settings } from "sigma/settings";

/**
 * Default and global styles that are controlled by Sigma's top-level rendering settings.
 */
export type SigmaStyleSettings = Partial<
  Pick<
    Settings,
    | "defaultNodeColor"
    | "defaultEdgeColor"
    | "labelFont"
    | "labelSize"
    | "labelWeight"
    | "labelColor"
    | "edgeLabelFont"
    | "edgeLabelSize"
    | "edgeLabelColor"
  >
>;

/**
 * Styles that contribute to Sigma's individual renderer functions.
 *
 * These support dark/light/system color scheme synchronization for canvas 2D and WebGL rendering.
 */
export type SigmaRenderStyles = {
  /**
   * Label background color for node hover labels.
   */
  backgroundColor: string;
  /**
   * Label outline (stroke) color for node hover labels.
   */
  borderColor: string;
  /**
   * Label border radius for node hover labels.
   */
  borderRadius: number | number[];
  /**
   * Box shadow blur for node hover labels.
   */
  shadowBlur?: number;
  /**
   * Box shadow color for node hover labels.
   */
  shadowColor?: string;
  /**
   * Box shadow horizontal offset for node hover labels.
   */
  shadowOffsetX?: number;
  /**
   * Box shadow vertical offset for node hover labels.
   */
  shadowOffsetY?: number;
};

/**
 * Color palettes support customization based on individual datasets, visualization/application state, etc.
 *
 * They are intended to override style defaults, usually applied through Sigma's reducers or directly in node/edge data.
 */
export type ColorPalette = {
  name: string;
  span: [string, string];
  edge: string;
  backgroundColor?: string;
};
