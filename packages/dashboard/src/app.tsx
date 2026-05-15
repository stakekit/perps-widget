import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Providers, useRootContainer } from "@yieldxyz/perps-common/context";
import type {
  ExternalWalletSource,
  LifecycleEvent,
} from "@yieldxyz/perps-common/domain";
import type { PerpsConfig } from "@yieldxyz/perps-common/services";
import { Preload } from "./components/modules/root/Preload";
import { SignTransactionsDialog } from "./components/modules/trade/order-form/sign-dialog";
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
      className="dark bg-background flex flex-col min-h-screen"
      ref={rootContainer}
    >
      <RouterProvider router={router} />
      <SignTransactionsDialog />
    </div>
  );
};

export type DashboardProps = {
  readonly config: Omit<PerpsConfig, "reownProjectId">;
  readonly externalWalletSource?: ExternalWalletSource;
  readonly onLifecycleEvent?: (event: LifecycleEvent) => void;
};

export const Dashboard = ({
  config,
  externalWalletSource,
  onLifecycleEvent,
}: DashboardProps) => {
  return (
    <Providers
      config={config}
      externalWalletSource={externalWalletSource}
      onLifecycleEvent={onLifecycleEvent}
    >
      <App />
      <Preload />
    </Providers>
  );
};
