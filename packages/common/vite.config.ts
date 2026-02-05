import { defineConfig } from "vite";
import { commonPlugins, commonViteConfig } from "./src/vite.config";

export default defineConfig({
  plugins: [
    commonPlugins.viteReact,
    commonPlugins.tailwindcss,
    commonPlugins.nodePolyfills,
  ],
  test: commonViteConfig.test,
  optimizeDeps: commonViteConfig.optimizeDeps,
});
