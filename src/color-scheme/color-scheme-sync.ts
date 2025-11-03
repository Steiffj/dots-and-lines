// https://web.dev/articles/prefers-color-scheme
export const THEME_ATTRIBUTE = "data-theme";
const html = document.getElementsByTagName("html")[0];

const callbacks: Set<DarkModeToggleFn> = new Set();
export function registerColorSchemeToggleHandler(listener: DarkModeToggleFn) {
  callbacks.add(listener);
}
function processCallbacks(mode: "dark" | "light") {
  callbacks.forEach((fn) => {
    fn(mode);
  });
}

/**
 * Do something when dark mode changes. Intended to synchronize visualization color schemes that aren't directly affected by CSS.
 */
export type DarkModeToggleFn = (mode: "dark" | "light") => void;

export function setupColorSchemeToggle() {
  // Detect when the HTML element's theme data attribute changes
  const observer = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      if (mut.type !== "attributes") {
        continue;
      }

      const attr = mut.attributeName as string;
      const theme = html.getAttribute(attr) as "dark" | "light";
      console.log(attr, theme);
      if (attr === THEME_ATTRIBUTE) {
        processCallbacks(theme);
      }
    }
  });
  observer.observe(html, {
    attributeFilter: [THEME_ATTRIBUTE],
  });

  // Handle OS color scheme preference changes - will trigger the above mutation observer for consistent processing
  const colorSchemeMediaQuery = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );
  colorSchemeMediaQuery.addEventListener("change", (e) => {
    const theme = e.matches ? "dark" : "light";
    html.setAttribute(THEME_ATTRIBUTE, theme);
  });
}

export function setColorScheme(mode: "dark" | "light") {
  html.setAttribute(THEME_ATTRIBUTE, mode);
}
