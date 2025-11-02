import "@fontsource/fira-mono";
import { PALETTE_HIGH_CONTRAST } from "./color-scheme/palettes";
import {
  registerDarkModeToggleHandler,
  setupDarkModeToggle,
} from "./dark-mode";
import { createTestGraph } from "./data";
import { setupSigma, sigmaDarkModeToggle } from "./sigma";
import "./style.css";

export default (function init() {
  const stage = document.getElementById("stage");
  if (!stage) {
    throw new Error(
      "Stage element is not configured correctly. Looking for element with ID `stage`."
    );
  }
  const graph = createTestGraph(
    { order: 15000, size: 25000, clusters: 9 },
    PALETTE_HIGH_CONTRAST
  );
  setupSigma(graph, stage, {
    labelFont: "Fira Mono",
    edgeLabelFont: "Fira Mono",
  });

  setupDarkModeToggle();
  registerDarkModeToggleHandler(sigmaDarkModeToggle);
})();
