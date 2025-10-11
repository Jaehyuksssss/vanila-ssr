import path from "node:path";
import { defineConfig } from "vite";

const LIB_NAME = "VanilaComponents";
const CSS_BUNDLE_NAME = "vanila-components.css";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: LIB_NAME,
      fileName: (format) => {
        switch (format) {
          case "es":
            return "vanila-components.es.js";
          case "cjs":
            return "vanila-components.cjs";
          default:
            return "vanila-components.umd.js";
        }
      },
      formats: ["es", "cjs", "umd"],
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        exports: "named",
        globals: {},
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return CSS_BUNDLE_NAME;
          }
          return assetInfo.name ?? "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
