import {
  registerDarkModeToggleHandler,
  setupDarkModeToggle,
} from "./dark-mode";
import { createTestGraph } from "./data";
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
  const graph = createTestGraph();
  setupSigma(graph, stage, {
    labelFont: "Fira Mono",
    edgeLabelFont: "Fira Mono",
  });

  setupDarkModeToggle();
  registerDarkModeToggleHandler(sigmaDarkModeToggle);
})();
