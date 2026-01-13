import {
  // createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster.tsx";
import {
  RootContainerProvider,
  useRootContainer,
} from "@/context/root-container.tsx";
import "./styles.css";
import { useAtomMount } from "@effect-atom/atom-react";
import { marketsAtom } from "@/atoms/markets-atoms.ts";
import { providersBalancesAtom } from "@/atoms/portfolio-atoms.ts";
import { providersAtom } from "@/atoms/providers-atoms.ts";
import { tokenBalancesAtom } from "@/atoms/tokens-atoms.ts";
import { walletAtom } from "@/atoms/wallet-atom.ts";
import { routeTree } from "./routeTree.gen.ts";

// const history = createMemoryHistory();

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  // history,
});

// Register the router instance for type safety
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
      className="dark min-h-screen bg-[#131517] p-8 flex justify-center items-center"
    >
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    </div>
  );
};

const AppWithProviders = () => {
  /**
   * Preload atoms
   */
  useAtomMount(walletAtom);
  useAtomMount(marketsAtom);
  useAtomMount(providersAtom);
  useAtomMount(tokenBalancesAtom);
  useAtomMount(providersBalancesAtom);

  return (
    <RootContainerProvider>
      <Toaster />
      <App />
    </RootContainerProvider>
  );
};

export default AppWithProviders;
