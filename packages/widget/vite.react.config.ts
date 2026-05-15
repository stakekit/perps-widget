import { resolve } from "node:path";
import {
  createNodePolyfillsPlugin,
  createReactCompilerPlugin,
  createTailwindPlugin,
  createViteReactPlugin,
} from "@yieldxyz/perps-common/vite.config";
import { defineConfig, esmExternalRequirePlugin } from "vite";

const reactExternals = [
  "react",
  "react-dom",
  "react-dom/client",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

export default defineConfig({
  plugins: [
    esmExternalRequirePlugin({
      external: [...reactExternals],
    }),
    createViteReactPlugin(),
    createReactCompilerPlugin(),
    createTailwindPlugin(),
    createNodePolyfillsPlugin(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        styles: resolve(__dirname, "src/styles-entry.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "react/[name].js",
        chunkFileNames: "react/chunks/[name]-[hash].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css")
            ? "styles.css"
            : "react/assets/[name][extname]",
      },
    },
  },
});
