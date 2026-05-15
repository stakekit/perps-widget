import { defineConfig } from "vite";
import {
  createCommonViteConfig,
  createNodePolyfillsPlugin,
  createTailwindPlugin,
  createViteReactPlugin,
} from "./src/vite.config";

const commonViteConfig = createCommonViteConfig();

export default defineConfig({
  plugins: [
    createViteReactPlugin(),
    createTailwindPlugin(),
    createNodePolyfillsPlugin(),
  ],
  test: commonViteConfig.test,
  optimizeDeps: commonViteConfig.optimizeDeps,
});
