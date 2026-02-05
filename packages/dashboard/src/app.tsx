import "./styles.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Providers, useRootContainer } from "@yieldxyz/perps-common/context";
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

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

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

export const Dashboard = () => {
  return (
    <Providers>
      <App />
      <Preload />
    </Providers>
  );
};
