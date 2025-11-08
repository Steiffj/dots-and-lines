import "@fontsource/fira-mono";
import { setupColorSchemeToggle } from "./color-scheme/color-scheme-sync";
import { PALETTE_HIGH_CONTRAST_CIRCLE } from "./color-scheme/palettes";
import { createSupernode } from "./data";
import { setupSigma } from "./sigma";
import "./style.css";

export default (function init() {
  const stage = document.getElementById("stage");
  if (!stage) {
    throw new Error(
      "Stage element is not configured correctly. Looking for element with ID `stage`."
    );
  }
  // const graph = createTestGraph(
  //   { order: 15000, size: 25000, clusters: 9 },
  //   PALETTE_HIGH_CONTRAST
  // );
  const graph = createSupernode(1000, PALETTE_HIGH_CONTRAST_CIRCLE);
  setupSigma(graph, stage, {
    renderEdgeLabels: true,
  });
  setupColorSchemeToggle();
})();
