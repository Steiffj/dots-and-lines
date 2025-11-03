import type { Attributes } from "graphology-types";
import type { Sigma } from "sigma";
import { LRUCache } from "../lru-cache";

export class RendererCache<
  N extends Attributes,
  E extends Attributes,
  A extends Attributes,
  KText,
  KShapes
> {
  offscreen: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
  text: LRUCache<KText, ImageBitmap>;
  shapes: LRUCache<KShapes, Path2D>;

  constructor(
    public readonly sigma: Sigma<N, E, A>,
    capacity: {
      text: number;
      shapes: number;
    },
    offscreenCanvas?: OffscreenCanvas
  ) {
    this.text = new LRUCache(capacity.text, (_, bitmap) => bitmap.close());
    this.shapes = new LRUCache(capacity.shapes);
    // TODO not sure that this needs to be the same resolution as the rendered canvas
    // If not, Sigma may not need to be a field at all
    const { height, width } = this.sigma.getDimensions();
    this.offscreen = offscreenCanvas ?? new OffscreenCanvas(width, height);

    const ctx = this.offscreen.getContext("2d");
    if (!ctx) {
      throw new Error(
        "Render cache's offscreen canvas was initialized with a '2d' context type (or less likely, there's a browser compatibility issue)."
      );
    }
    this.ctx = ctx;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.offscreen.width, this.offscreen.height);
  }

  close() {
    this.text.clear();
    this.shapes.clear();
  }
}
