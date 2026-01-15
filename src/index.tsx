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
import { Result, useAtomMount, useAtomValue } from "@effect-atom/atom-react";
import { marketsAtom } from "@/atoms/markets-atoms.ts";
import {
  ordersAtom,
  positionsAtom,
  providersBalancesAtom,
} from "@/atoms/portfolio-atoms.ts";
import { providersAtom } from "@/atoms/providers-atoms.ts";
import { moralisTokenBalancesAtom } from "@/atoms/tokens-atoms.ts";
import { walletAtom } from "@/atoms/wallet-atom.ts";
import { AppKit } from "@/context/appkit.tsx";
import { isWalletConnected, type WalletConnected } from "@/domain/wallet.ts";
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

const PreloadWalletConnectedAtoms = ({
  wallet,
}: {
  wallet: WalletConnected;
}) => {
  useAtomMount(moralisTokenBalancesAtom(wallet.currentAccount.address));
  useAtomMount(providersBalancesAtom(wallet));
  useAtomMount(positionsAtom(wallet));
  useAtomMount(ordersAtom(wallet));

  return null;
};

const PreloadAtoms = () => {
  const wallet = useAtomValue(walletAtom);
  useAtomMount(marketsAtom);
  useAtomMount(providersAtom);

  if (Result.isSuccess(wallet) && isWalletConnected(wallet.value)) {
    return <PreloadWalletConnectedAtoms wallet={wallet.value} />;
  }

  return null;
};

const AppWithProviders = () => {
  return (
    <AppKit>
      <RootContainerProvider>
        <Toaster />
        <App />
        <PreloadAtoms />
      </RootContainerProvider>
    </AppKit>
  );
};

export default AppWithProviders;
