import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import type { UserConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import type { InlineConfig } from "vitest/node";

declare module "vite" {
  interface UserConfig {
    test?: InlineConfig;
  }
}

export const createTanstackRouterPlugin = () =>
  tanstackRouter({
    target: "react",
    autoCodeSplitting: true,
  });

export const createViteReactPlugin = () => viteReact();

export const createReactCompilerPlugin = () =>
  babel({ presets: [reactCompilerPreset()] });

export const createTailwindPlugin = () => tailwindcss();

export const createNodePolyfillsPlugin = () =>
  nodePolyfills({ include: ["buffer"] });

export const createCommonViteConfig = (): UserConfig => ({
  plugins: [
    createTanstackRouterPlugin(),
    createViteReactPlugin(),
    createReactCompilerPlugin(),
    createTailwindPlugin(),
    createNodePolyfillsPlugin(),
  ],
  test: {
    browser: {
      screenshotFailures: false,
      headless: true,
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    include: ["./tests/**/*.test.{ts,tsx}"],
  },
  optimizeDeps: {
    include: [
      "vite-plugin-node-polyfills/shims/buffer",
      "vite-plugin-node-polyfills/shims/global",
      "vite-plugin-node-polyfills/shims/process",
    ],
  },
});
