import { useAtomValue } from "@effect/atom-react";
import * as Result from "effect/unstable/reactivity/AsyncResult";
import { WagmiProvider } from "wagmi";
import { walletAdapterAtom } from "../atoms/wallet-adapter-atoms";

export const AppKit = ({ children }: { children: React.ReactNode }) => {
  const walletAdapter = useAtomValue(walletAdapterAtom);

  if (
    Result.isSuccess(walletAdapter) &&
    walletAdapter.value.mode === "browser"
  ) {
    return (
      <WagmiProvider config={walletAdapter.value.wagmiAdapter.wagmiConfig}>
        {children}
      </WagmiProvider>
    );
  }

  return children;
};
