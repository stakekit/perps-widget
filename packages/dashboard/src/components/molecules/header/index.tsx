import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { useAppKit } from "@reown/appkit/react";
import { Link } from "@tanstack/react-router";
import hyperliquidLogo from "@yieldxyz/perps-common/assets/hyperliquid.png";
import {
  providersAtom,
  selectedProviderAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  AddressSwitcher,
  Button,
  Dialog,
  Text,
} from "@yieldxyz/perps-common/components";
import {
  isBrowserWallet,
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import { cn, truncateAddress } from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Logo } from "../../atoms/logo";
import { DepositDialog } from "./deposit/deposit-dialog";
import { WithdrawDialog } from "./withdraw/withdraw-dialog";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-center px-6 py-5 bg-content-background border-b border-content-background",
        className,
      )}
    >
      <div className="max-w-[1720px] w-full flex items-center justify-between">
        {/* Left side: Logo + Navigation */}
        <div className="flex items-center gap-5">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center h-8 pl-!.5">
            <Logo />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-[45px] px-3">
            <Link
              to="/"
              activeProps={{
                className: "text-white",
              }}
              inactiveProps={{
                className: "text-white/40 hover:text-white/60",
              }}
            >
              Trade
            </Link>
          </nav>
        </div>

        {/* Right side: Wallet section */}
        <HeaderWalletSection />
      </div>
    </header>
  );
}

function HeaderWalletSection() {
  const { open } = useAppKit();
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));

  const browserWallet = isBrowserWallet(wallet);
  const walletConnected = isWalletConnected(wallet);

  // Disconnected state - show Connect button
  if (!walletConnected) {
    return (
      <div className="flex items-center">
        <Button
          variant="default"
          size="sm"
          className="bg-white text-black hover:bg-white/90 rounded-[10px] h-10 px-3.5 font-semibold text-[15px]"
          onClick={() => browserWallet && open()}
        >
          Connect
        </Button>
      </div>
    );
  }

  // Connected state - show provider selector, address, and deposit button
  return <ConnectedWalletSection wallet={wallet} />;
}

function ConnectedWalletSection({ wallet }: { wallet: WalletConnected }) {
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const providers = useAtomValue(providersAtom).pipe(
    Result.getOrElse(() => [] as ReadonlyArray<ApiTypes.ProviderDto>),
  );
  const selectedProvider = useAtomValue(selectedProviderAtom).pipe(
    Result.getOrElse(() => null),
  );
  const setSelectedProvider = useAtomSet(selectedProviderAtom);

  const handleProviderSelect = (provider: ApiTypes.ProviderDto) => {
    setSelectedProvider(provider);
    setProviderDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Provider selector */}
      <button
        type="button"
        onClick={() => setProviderDialogOpen(true)}
        className="bg-white/5 flex items-center gap-2 h-10 px-4 rounded-[10px] hover:bg-white/10 transition-colors overflow-hidden"
      >
        <img
          src={hyperliquidLogo}
          alt={selectedProvider?.name ?? "Provider"}
          className="size-5 rounded-full"
        />
        <span className="text-[13px] text-white/60">
          {selectedProvider?.name ?? "Select provider"}
        </span>
        <ChevronRight className="size-5 text-white/60 rotate-90" />
      </button>

      {/* Provider dialog */}
      <Dialog.Root
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
      >
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Popup>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Select Provider</Dialog.Title>
              </Dialog.Header>

              <div className="flex flex-col gap-1.5 py-2">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderSelect(provider)}
                    className={cn(
                      "w-full flex items-center gap-2 p-3 rounded-xl transition-colors",
                      selectedProvider?.id === provider.id
                        ? "bg-white/5"
                        : "bg-black/20",
                      "cursor-pointer hover:bg-white/10",
                    )}
                  >
                    <img
                      src={hyperliquidLogo}
                      alt={provider.name}
                      className="size-6 rounded-full"
                    />
                    <Text as="span" variant="labelSmWhiteNegNoLeading">
                      {provider.name}
                    </Text>
                  </button>
                ))}
              </div>
            </Dialog.Content>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Address display with switcher */}
      <AddressSwitcher
        wallet={wallet}
        trigger={
          <button
            type="button"
            className="bg-white/5 flex items-center justify-between h-10 pl-4 pr-3 gap-2 rounded-[10px] overflow-hidden hover:bg-white/10 transition-colors"
          >
            <span className="text-[13px] text-white/60">
              {truncateAddress(wallet.currentAccount.address)}
            </span>
            <ChevronRight className="size-5 text-white/60 rotate-90" />
          </button>
        }
      />

      {/* Withdraw button */}
      <Button
        variant="default"
        size="sm"
        className="bg-white/10 text-white hover:bg-white/20 rounded-[10px] border-none px-3.5 font-semibold text-[15px]"
        onClick={() => setWithdrawDialogOpen(true)}
      >
        Withdraw
      </Button>

      {/* Deposit button */}
      <Button
        variant="default"
        size="sm"
        className="bg-white text-black hover:bg-white/90 rounded-[10px] border-none px-3.5 font-semibold text-[15px]"
        onClick={() => setDepositDialogOpen(true)}
      >
        Deposit
      </Button>

      {/* Withdraw dialog */}
      <WithdrawDialog
        wallet={wallet}
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
      />

      {/* Deposit dialog */}
      <DepositDialog
        wallet={wallet}
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
      />
    </div>
  );
}
