import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Providers, useRootContainer } from "@yieldxyz/perps-common/context";
import type {
  ExternalWalletSource,
  LifecycleEvent,
} from "@yieldxyz/perps-common/domain";
import {
  type PerpsConfig,
  TRADING_VIEW_WIDGET_SCRIPT_URL,
} from "@yieldxyz/perps-common/services";
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

const App = () => {
  const rootContainer = useRootContainer();

  return (
    <div
      ref={rootContainer}
      className="dark bg-background w-full sm:w-[400px] min-h-[600px] rounded-3xl py-6 px-4 flex flex-col *:flex-1"
    >
      <RouterProvider router={router} />
    </div>
  );
};

export type WidgetProps = {
  readonly config: Omit<PerpsConfig, "reownProjectId">;
  readonly externalWalletSource?: ExternalWalletSource;
  readonly onLifecycleEvent?: (event: LifecycleEvent) => void;
};

export const Widget = ({
  config,
  externalWalletSource,
  onLifecycleEvent,
}: WidgetProps) => {
  preload(TRADING_VIEW_WIDGET_SCRIPT_URL, { as: "script" });

  return (
    <Providers
      config={config}
      externalWalletSource={externalWalletSource}
      onLifecycleEvent={onLifecycleEvent}
    >
      <App />
      <PreloadAtoms />
    </Providers>
  );
};
