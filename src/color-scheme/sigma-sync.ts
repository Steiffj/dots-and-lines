import type { DALSigma } from "../dal-types";
import type { SigmaRenderStyles, SigmaStyleSettings } from "./types";
import chroma from "chroma-js";

const SIGMA_SETTINGS = document.getElementById("sigma-settings");
const SIGMA_STYLES = document.getElementById("sigma-styles");

export function syncSigmaColorScheme(sigma: DALSigma) {
  if (!SIGMA_SETTINGS) {
    throw new Error("Sigma settings element is missing.");
  }

  if (!SIGMA_STYLES) {
    throw new Error("Sigma styles element is missing.");
  }

  for (const el of SIGMA_SETTINGS.querySelectorAll("div")) {
    const setting = el.dataset["sigmaSetting"];
    if (!setting) {
      throw new Error(`Missing 'sigma-setting' data attribute from ${el}`);
    }

    switch (setting as keyof SigmaStyleSettings) {
      case "defaultNodeColor":
        sigma.setSetting(
          "defaultNodeColor",
          chroma(getComputedStyle(el).backgroundColor).hex("rgba")
        );
        break;
      case "defaultEdgeColor":
        sigma.setSetting(
          "defaultEdgeColor",
          chroma(getComputedStyle(el).backgroundColor).hex("rgba")
        );
        break;
      case "labelFont":
        sigma.setSetting("labelFont", getComputedStyle(el).fontFamily);
        break;
      case "labelSize":
        sigma.setSetting(
          "labelSize",
          +getComputedStyle(el).fontSize.slice(0, -2)
        );
        break;
      case "labelWeight":
        sigma.setSetting("labelWeight", getComputedStyle(el).fontWeight);
        break;
      case "labelColor":
        sigma.setSetting("labelColor", { color: getComputedStyle(el).color });
        break;
      case "edgeLabelFont":
        sigma.setSetting("edgeLabelFont", getComputedStyle(el).fontFamily);
        break;
      case "edgeLabelSize":
        sigma.setSetting(
          "edgeLabelSize",
          +getComputedStyle(el).fontSize.slice(0, -2) // removes 'px' from computed style
        );
        break;
      case "edgeLabelColor":
        sigma.setSetting("edgeLabelColor", {
          color: getComputedStyle(el).color,
        });
        break;
      default:
        throw new Error(
          `'${setting}' is not a valid Sigma setting. Read from ${el}`
        );
    }
  }

  const styles: Partial<SigmaRenderStyles> = {};
  for (const el of SIGMA_STYLES.querySelectorAll("div")) {
    const setting = el.dataset["sigmaStyle"];
    if (!setting) {
      throw new Error(`Missing 'sigma-style' data attribute from ${el}`);
    }

    switch (setting as keyof SigmaRenderStyles) {
      case "backgroundColor":
        styles.backgroundColor = getComputedStyle(el).backgroundColor;
        break;
      case "borderColor":
        styles.borderColor = getComputedStyle(el).borderColor;
        break;
      case "borderRadius":
        styles.borderRadius = +getComputedStyle(el).borderRadius.slice(0, -2); // removes 'px' TODO could also be an array - should support parsing for different border radii values
        break;
      default:
        throw new Error(
          `'${setting}' is not a valid Sigma render style. Read from ${el}`
        );
    }
  }

  if (!styles.backgroundColor || !styles.borderColor || !styles.borderRadius) {
    throw new Error(`Missing Sigma rendering style from ${SIGMA_STYLES}`);
  }

  sigma.getGraph().setAttribute("styles", styles as SigmaRenderStyles);
}
