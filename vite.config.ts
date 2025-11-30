import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  plugins: [tailwindcss()],
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
});
