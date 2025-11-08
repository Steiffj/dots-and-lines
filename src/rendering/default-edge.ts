import type {
  EdgeDisplayData,
  NodeDisplayData,
  PartialButFor,
} from "sigma/types";
import type {
  DALEdgeAttrs,
  DALGraphAttrs,
  DALNodeAttrs,
  DALSettings,
  DALSigma,
} from "../dal-types";
import { RendererCache } from "./renderer-cache";

export class DefaultEdgeLabelRenderer {
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
        // Testing LRU cache eviction effect on rendering
        // Keep in sync with a max edge label render setting for actual implementation
        text: 1000,
        shapes: 0,
      },
      offscreenCanvas
    );

    this.sigma.once("kill", () => {
      this.cache.close();
    });
  }

  readonly drawStraightEdgeLabel = (
    ctx: CanvasRenderingContext2D,
    edgeData: PartialButFor<EdgeDisplayData, "label" | "color" | "size">,
    sourceData: PartialButFor<NodeDisplayData, "x" | "y" | "size">,
    targetData: PartialButFor<NodeDisplayData, "x" | "y" | "size">,
    settings: DALSettings
  ): void => {
    const size = settings.edgeLabelSize,
      font = settings.edgeLabelFont,
      weight = settings.edgeLabelWeight,
      color = settings.edgeLabelColor.attribute
        ? edgeData[settings.edgeLabelColor.attribute] ||
          settings.edgeLabelColor.color ||
          "#000"
        : settings.edgeLabelColor.color;

    let label = edgeData.label;
    if (!label) {
      return;
    }

    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px ${font}`;

    // Computing positions without considering nodes sizes:
    const sSize = sourceData.size;
    const tSize = targetData.size;
    let sx = sourceData.x;
    let sy = sourceData.y;
    let tx = targetData.x;
    let ty = targetData.y;
    let cx = (sx + tx) / 2;
    let cy = (sy + ty) / 2;
    let dx = tx - sx;
    let dy = ty - sy;
    let d = Math.sqrt(dx * dx + dy * dy);

    if (d < sSize + tSize) {
      return;
    }

    // Adding nodes sizes:
    sx += (dx * sSize) / d;
    sy += (dy * sSize) / d;
    tx -= (dx * tSize) / d;
    ty -= (dy * tSize) / d;
    cx = (sx + tx) / 2;
    cy = (sy + ty) / 2;
    dx = tx - sx;
    dy = ty - sy;
    d = Math.sqrt(dx * dx + dy * dy);

    // Handling ellipsis
    let textLength = ctx.measureText(label).width;

    if (textLength > d) {
      const ellipsis = "…";
      label = label + ellipsis;
      textLength = ctx.measureText(label).width;

      while (textLength > d && label.length > 1) {
        label = label.slice(0, -2) + ellipsis;
        textLength = ctx.measureText(label).width;
      }

      if (label.length < 4) {
        return;
      }
    }

    let angle;
    if (dx > 0) {
      if (dy > 0) angle = Math.acos(dx / d);
      else angle = Math.asin(dy / d);
    } else {
      if (dy > 0) angle = Math.acos(dx / d) + Math.PI;
      else angle = Math.asin(dx / d) + Math.PI / 2;
    }

    const cacheKey = `${label}${ctx.fillStyle}${ctx.font}`;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const cachedText = this.cache.text.get(cacheKey);
    if (cachedText) {
      ctx.drawImage(cachedText, -textLength / 2, edgeData.size / 2 + size);
    } else {
      const metrics = this.cache.ctx.measureText(label);
      const height =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      this.cache.resize(
        metrics.width,
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      );
      this.cache.ctx.fillStyle = color;
      this.cache.ctx.font = `${weight} ${size}px ${font}`;
      this.cache.ctx.fillText(label, 0, height);
      createImageBitmap(this.cache.offscreen).then((textImg) => {
        this.cache.text.set(cacheKey, textImg);
      });

      // ctx.fillText(label, -textLength / 2, edgeData.size / 2 + size);
    }

    ctx.restore();
  };
}
