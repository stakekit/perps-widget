import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { useAppKit } from "@reown/appkit/react";
import { Link } from "@tanstack/react-router";
import hyperliquid from "@yieldxyz/perps-common/assets/hyperliquid.png";
import {
  positionsAtom,
  providersAtom,
  selectedProviderAtom,
  selectedProviderBalancesAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  AddressSwitcher,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@yieldxyz/perps-common/components";
import {
  isBrowserWallet,
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import { cn, formatAmount } from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { Record } from "effect";
import {
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Repeat2,
} from "lucide-react";
import { useState } from "react";
import { AccountValueDisplay } from "../../molecules/account-value-display";
import { ProviderSelect } from "../../molecules/provider-select";
import { AssetList } from "./AssetList";
import { Positions } from "./Positions";

const ProviderBalancesDisplay = ({ wallet }: { wallet: WalletConnected }) => {
  const selectedProviderBalances = useAtomValue(
    selectedProviderBalancesAtom(wallet.currentAccount.address),
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

const PositionsTabLabel = ({ wallet }: { wallet: WalletConnected }) => {
  const positionsResult = useAtomValue(
    positionsAtom(wallet.currentAccount.address),
  );
  const positionsCount = positionsResult.pipe(
    Result.map((positions) => Record.size(positions)),
    Result.getOrElse(() => 0),
  );

  return (
    <Text as="span" variant="labelSm">
      Positions ({positionsCount})
    </Text>
  );
};

export const Home = () => {
  const [activeTab, setActiveTab] = useState<"trade" | "positions">("trade");
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));

  const browserWallet = isBrowserWallet(wallet);
  const walletConnected = isWalletConnected(wallet);
  const showAddressSwitcher = walletConnected;

  const providers = useAtomValue(providersAtom).pipe(
    Result.getOrElse(() => [] as ReadonlyArray<ApiTypes.ProviderDto>),
  );
  const selectedProvider = useAtomValue(selectedProviderAtom).pipe(
    Result.getOrElse(() => null),
  );
  const setSelectedProvider = useAtomSet(selectedProviderAtom);

  return (
    <div className="flex flex-col justify-between">
      <div className="flex flex-col gap-3">
        {/* Address Switcher */}
        {showAddressSwitcher && <AddressSwitcher wallet={wallet} />}

        {/* Header */}
        <div className="flex justify-between items-center">
          <Text as="p" variant="titleXl">
            Perps
          </Text>
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
              <Text as="span" variant="labelSm">
                Trade
              </Text>
            </TabsTrigger>
            <TabsTrigger value="positions" className="gap-2">
              <ChartNoAxesColumnIncreasing className="w-3.5 h-3.5" />
              {walletConnected ? (
                <PositionsTabLabel wallet={wallet} />
              ) : (
                <Text as="span" variant="labelSm">
                  Positions (0)
                </Text>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="mt-4">
            <AssetList />
          </TabsContent>

          <TabsContent value="positions" className="mt-4">
            <Positions />
          </TabsContent>
        </Tabs>
      </div>

      {!walletConnected && browserWallet && <ConnectWalletButton />}
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
