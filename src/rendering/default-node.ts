import type { NodeDisplayData, PartialButFor } from "sigma/types";
import type {
  DALEdgeAttrs,
  DALGraphAttrs,
  DALNodeAttrs,
  DALSettings,
  DALSigma,
} from "../dal-types";
import { RendererCache } from "./renderer-cache";
import chroma from "chroma-js";

export class DefaultNodeLabelRenderer {
  cache: RendererCache<
    DALNodeAttrs,
    DALEdgeAttrs,
    DALGraphAttrs,
    string,
    string
  >;

  constructor(
    public readonly sigma: DALSigma,
    offscreenCanvas?: OffscreenCanvas
  ) {
    this.cache = new RendererCache(
      sigma,
      {
        text: 500,
        shapes: 100,
      },
      offscreenCanvas
    );

    this.sigma.once("kill", () => {
      this.cache.close();
    });
  }

  get state() {
    return this.sigma.getGraph().getAttribute("uiState");
  }

  get styles() {
    return this.sigma.getGraph().getAttribute("styles");
  }

  get palette() {
    return this.sigma.getGraph().getAttribute("palette");
  }

  /**
   * Basic node label renderer. Displays label text with default styles.
   *
   * Adapted from built-in Sigma label renderer.
   */
  readonly drawLabel = (
    ctx: CanvasRenderingContext2D,
    data: PartialButFor<
      NodeDisplayData,
      "x" | "y" | "size" | "label" | "color"
    >,
    settings: DALSettings
  ): void => {
    if (!data.label) {
      return;
    }

    const size = settings.labelSize,
      font = settings.labelFont,
      weight = settings.labelWeight,
      color = settings.labelColor.attribute
        ? data[settings.labelColor.attribute] ||
          settings.labelColor.color ||
          "#000"
        : settings.labelColor.color;

    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px ${font}`;

    ctx.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
  };

  /**
   * Default node hover renderer. Displays label text with a background.
   *
   * Adapted from built-in Sigma hover renderer.
   */
  readonly drawHover = (
    ctx: CanvasRenderingContext2D,
    data: PartialButFor<
      NodeDisplayData,
      "x" | "y" | "size" | "label" | "color"
    >,
    settings: DALSettings
  ): void => {
    // const state = this.state;
    // if (state.dragging) {
    //   this.drawLabel(ctx, data, settings);
    //   return;
    // }

    const styles = this.styles;
    const size = settings.labelSize,
      font = settings.labelFont,
      weight = settings.labelWeight;

    ctx.font = `${weight} ${size}px ${font}`;

    // Draw the label background
    ctx.fillStyle = styles.backgroundColor;
    // ctx.strokeStyle = styles.borderColor; // TODO doesn't look good with box shadow plus outline around node
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 6;
    ctx.shadowColor = chroma(styles.shadowColor ?? "#000000")
      .alpha(0.5)
      .css();

    const PADDING = 2;

    if (typeof data.label === "string") {
      const textWidth = ctx.measureText(data.label).width,
        boxWidth = Math.round(textWidth + 5),
        boxHeight = Math.round(size + 2 * PADDING),
        radius = Math.max(data.size, size / 2) + PADDING;

      const angleRadian = Math.asin(boxHeight / 2 / radius);
      const xDeltaCoord = Math.sqrt(
        Math.abs(Math.pow(radius, 2) - Math.pow(boxHeight / 2, 2))
      );

      ctx.beginPath();
      ctx.moveTo(data.x + xDeltaCoord, data.y + boxHeight / 2);
      ctx.lineTo(data.x + radius + boxWidth, data.y + boxHeight / 2);
      ctx.lineTo(data.x + radius + boxWidth, data.y - boxHeight / 2);
      ctx.lineTo(data.x + xDeltaCoord, data.y - boxHeight / 2);
      ctx.arc(data.x, data.y, radius, angleRadian, -angleRadian);
      ctx.closePath();
      ctx.fill();
      // ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(data.x, data.y, data.size + PADDING, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Draw the label text
    this.drawLabel(ctx, data, settings);
  };
}
