import { Result, useAtomValue } from "@effect-atom/atom-react";
import { AppKitProvider } from "@reown/appkit/react";
import { configAtom } from "@/atoms/config-atom";
import { walletAtom } from "@/atoms/wallet-atom";

export const AppKit = ({ children }: { children: React.ReactNode }) => {
  const config = useAtomValue(configAtom);
  const wallet = useAtomValue(walletAtom);

  const result = Result.all({
    config,
    wallet,
  });

  if (Result.isSuccess(result)) {
    return (
      <AppKitProvider
        projectId={result.value.config.reownProjectId}
        networks={result.value.wallet.networks}
        adapters={[result.value.wallet.wagmiAdapter]}
        themeVariables={{
          "--apkt-font-family": "var(--font-family)",
        }}
        enableNetworkSwitch={false}
      >
        {children}
      </AppKitProvider>
    );
  }

  return children;
};
