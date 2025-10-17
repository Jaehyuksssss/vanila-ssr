import path from "node:path";
import { defineConfig } from "vite";

const LIB_NAME = "VanillaSSR";
const CSS_BUNDLE_NAME = "vanilla-ssr.css";

export default defineConfig({
  build: {
    lib: {
      entry: {
        // Main entries
        index: path.resolve(__dirname, "src/index.ts"),
        server: path.resolve(__dirname, "src/server.ts"),
        client: path.resolve(__dirname, "src/client.ts"),
        
        // Individual component entries (create these as needed)
        "components/modal": path.resolve(__dirname, "src/components/modal.ts"),
        "components/accordion": path.resolve(__dirname, "src/components/accordion.ts"),
        "components/data-table": path.resolve(__dirname, "src/components/data-table.ts"),
        "components/toast": path.resolve(__dirname, "src/components/toast.ts"),
        "components/bottomsheet": path.resolve(__dirname, "src/components/bottomsheet.ts"),
        
        // Utility entries
        utilities: path.resolve(__dirname, "src/utilities.ts"),
        theme: path.resolve(__dirname, "src/theme.ts"),
        accessibility: path.resolve(__dirname, "src/accessibility.ts"),
        security: path.resolve(__dirname, "src/security.ts"),
      },
      name: LIB_NAME,
      fileName: (format, entryName) => {
        const extension = format === "es" ? "js" : "cjs";
        
        // Main bundles keep original naming
        if (entryName === "index") {
          return `vanilla-ssr.${extension}`;
        }
        
        return `${entryName}.${extension}`;
      },
      formats: ["es", "cjs"],
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
      // Optimize bundle splitting
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    // Optimize for production
    minify: "esbuild",
    target: "es2020",
    
    // Ensure CSS is extracted properly
    cssCodeSplit: false,
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
  },
});
