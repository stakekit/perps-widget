import { Result, useAtomValue } from "@effect-atom/atom-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { configAtom } from "@/atoms/config-atom";
import { walletAtom } from "@/atoms/wallet-atom";

const qc = new QueryClient();

export const AppKit = ({ children }: { children: React.ReactNode }) => {
  const config = useAtomValue(configAtom);
  const wallet = useAtomValue(walletAtom);

  const result = Result.all({
    config,
    wallet,
  });

  if (Result.isSuccess(result) && result.value.wallet.type === "browser") {
    return (
      <WagmiProvider config={result.value.wallet.wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </WagmiProvider>
    );
  }

  return children;
};
