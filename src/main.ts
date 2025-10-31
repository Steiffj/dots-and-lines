import {
  registerDarkModeToggleHandler,
  setupDarkModeToggle,
} from "./dark-mode";
import { createTestGraph } from "./data";
import { PALETTE_HIGH_CONTRAST, PALETTE_HOT } from "./palettes";
import { setupSigma, sigmaDarkModeToggle } from "./sigma";
import "./style.css";
import "@fontsource/fira-mono";

export default (function init() {
  const stage = document.getElementById("stage");
  if (!stage) {
    throw new Error(
      "Stage element is not configured correctly. Looking for element with ID `stage`."
    );
  }
  const graph = createTestGraph(
    { order: 3600, size: 8000, clusters: 6 },
    PALETTE_HIGH_CONTRAST
  );
  setupSigma(graph, stage, {
    labelFont: "Fira Mono",
    edgeLabelFont: "Fira Mono",
  });

  setupDarkModeToggle();
  registerDarkModeToggleHandler(sigmaDarkModeToggle);
})();
