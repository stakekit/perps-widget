import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { useAppKit } from "@reown/appkit/react";
import { Link } from "@tanstack/react-router";
import {
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Repeat2,
} from "lucide-react";
import { useState } from "react";
import hyperliquid from "@/assets/hyperliquid.png";
import { selectedProviderBalancesAtom } from "@/atoms/portfolio-atoms";
import { providersAtom, selectedProviderAtom } from "@/atoms/providers-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { AssetList } from "@/components/modules/Home/AssetList";
import { Positions } from "@/components/modules/Home/Positions";
import { AccountValueDisplay } from "@/components/molecules/account-value-display";
import { AddressSwitcher } from "@/components/molecules/address-switcher";
import { ProviderSelect } from "@/components/molecules/provider-select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isWalletConnected, type WalletConnected } from "@/domain/wallet";
import { cn, formatAmount } from "@/lib/utils";
import type { ProviderDto } from "@/services/api-client/api-schemas";

const ProviderBalancesDisplay = ({ wallet }: { wallet: WalletConnected }) => {
  const selectedProviderBalances = useAtomValue(
    selectedProviderBalancesAtom(wallet),
  );

  if (Result.isSuccess(selectedProviderBalances)) {
    return (
      <div
        className={cn(
          selectedProviderBalances.value.unrealizedPnl >= 0
            ? "text-accent-green"
            : "text-accent-red",
          "font-semibold text-base tracking-tight items-center justify-center group-hover:hidden flex",
        )}
      >
        {formatAmount(selectedProviderBalances.value.unrealizedPnl)}
      </div>
    );
  }

  return null;
};

export const Home = () => {
  const [activeTab, setActiveTab] = useState<"trade" | "positions">("trade");
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));

  const walletConnected = isWalletConnected(wallet);

  const providers = useAtomValue(providersAtom).pipe(
    Result.getOrElse(() => [] as ReadonlyArray<ProviderDto>),
  );
  const selectedProvider = useAtomValue(selectedProviderAtom).pipe(
    Result.getOrElse(() => null),
  );
  const setSelectedProvider = useAtomSet(selectedProviderAtom);

  return (
    <div className="flex flex-col gap-3 justify-center">
      {/* Address Switcher */}
      {walletConnected && <AddressSwitcher wallet={wallet} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="font-semibold text-xl text-foreground">Perps</p>
        <ProviderSelect.Root
          providers={providers}
          value={selectedProvider ?? undefined}
          onValueChange={setSelectedProvider}
        >
          <ProviderSelect.Trigger className="p-0 rounded-full px-1 py-1">
            <img
              src={hyperliquid}
              className="w-8 h-8 rounded-full"
              alt="provider"
            />
          </ProviderSelect.Trigger>
          <ProviderSelect.Modal>
            <ProviderSelect.List />
          </ProviderSelect.Modal>
        </ProviderSelect.Root>
      </div>

      {/* Account value */}
      {walletConnected && (
        <Link to="/account" disabled={!isWalletConnected(wallet)}>
          <div className="rounded-2xl p-4 flex justify-between items-center bg-gray-5 group">
            <AccountValueDisplay wallet={wallet} />

            <div className="text-white font-semibold text-base tracking-tight items-center justify-center group-hover:flex hidden">
              <ChevronRight className="size-6" />
            </div>

            <ProviderBalancesDisplay wallet={wallet} />
          </div>
        </Link>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="trade" className="gap-2">
            <Repeat2 className="w-3.5 h-3.5" />
            <span className="font-semibold text-sm tracking-tight">Trade</span>
          </TabsTrigger>
          <TabsTrigger value="positions" className="gap-2">
            <ChartNoAxesColumnIncreasing className="w-3.5 h-3.5" />
            <span className="font-semibold text-sm tracking-tight">
              Positions
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="mt-4">
          <AssetList />
        </TabsContent>

        <TabsContent value="positions" className="mt-4">
          <Positions />
        </TabsContent>
      </Tabs>

      {!walletConnected && <ConnectWalletButton />}
    </div>
  );
};

const ConnectWalletButton = () => {
  const { open } = useAppKit();

  return (
    <div className="flex justify-center w-full pt-1">
      <Button className="w-full" onClick={() => open()}>
        Connect Wallet
      </Button>
    </div>
  );
};
