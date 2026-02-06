import { defineConfig } from "vite";
import { commonPlugins, createCommonViteConfig } from "./src/vite.config";

const commonViteConfig = createCommonViteConfig();

export default defineConfig({
  plugins: [
    commonPlugins.viteReact,
    commonPlugins.tailwindcss,
    commonPlugins.nodePolyfills,
  ],
  test: commonViteConfig.test,
  optimizeDeps: commonViteConfig.optimizeDeps,
});
