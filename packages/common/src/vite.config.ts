import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import type { UserConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import type { InlineConfig } from "vitest/node";

declare module "vite" {
  interface UserConfig {
    test?: InlineConfig;
  }
}

export const commonPlugins = {
  tanstackRouter: tanstackRouter({
    target: "react",
    autoCodeSplitting: true,
  }),
  viteReact: viteReact({
    babel: {
      plugins: ["babel-plugin-react-compiler"],
    },
  }),
  tailwindcss: tailwindcss(),
  nodePolyfills: nodePolyfills({ include: ["buffer"] }),
};

const createTanstackRouterPlugin = () =>
  tanstackRouter({
    target: "react",
    autoCodeSplitting: true,
  });

const createViteReactPlugin = () =>
  viteReact({
    babel: {
      plugins: ["babel-plugin-react-compiler"],
    },
  });

const createTailwindPlugin = () => tailwindcss();

const createNodePolyfillsPlugin = () => nodePolyfills({ include: ["buffer"] });

export const createCommonViteConfig = (): UserConfig => ({
  plugins: [
    createTanstackRouterPlugin(),
    createViteReactPlugin(),
    createTailwindPlugin(),
    createNodePolyfillsPlugin(),
  ],
  test: {
    browser: {
      screenshotFailures: false,
      headless: true,
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/config/browser/playwright
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
