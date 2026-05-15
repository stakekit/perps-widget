import { resolve } from "node:path";
import {
  createNodePolyfillsPlugin,
  createReactCompilerPlugin,
  createViteReactPlugin,
} from "@yieldxyz/perps-common/vite.config";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    createViteReactPlugin(),
    createReactCompilerPlugin(),
    createNodePolyfillsPlugin(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: {
        vanilla: resolve(__dirname, "src/vanilla.tsx"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "vanilla/[name].js",
        chunkFileNames: "vanilla/chunks/[name]-[hash].js",
        assetFileNames: "vanilla/assets/[name][extname]",
      },
    },
  },
});
