import { createRouter, RouterProvider } from "@tanstack/react-router";
import "./styles.css";
import { Providers, useRootContainer } from "@yieldxyz/perps-common/context";
import { TRADING_VIEW_WIDGET_SCRIPT_URL } from "@yieldxyz/perps-common/services";
import { preload } from "react-dom";
import { PreloadAtoms } from "./components/modules/Root/PreloadAtoms";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  const rootContainer = useRootContainer();

  return (
    <div
      ref={rootContainer}
      className="dark bg-background w-[400px] min-h-[600px] rounded-3xl py-6 px-4 flex flex-col *:flex-1"
    >
      <RouterProvider router={router} />
    </div>
  );
};

export const Widget = () => {
  preload(TRADING_VIEW_WIDGET_SCRIPT_URL, { as: "script" });

  return (
    <Providers>
      <App />
      <PreloadAtoms />
    </Providers>
  );
};
