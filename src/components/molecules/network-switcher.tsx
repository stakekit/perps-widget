import type { AppKitNetwork } from "@reown/appkit/networks";
import { useAppKitNetwork } from "@reown/appkit/react";
import { EvmNetworks } from "@stakekit/common";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { TokenIcon } from "@/components/molecules/token-icon";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { SupportedSKChains } from "@/domain/chains";
import type { WalletConnected } from "@/domain/wallet";
import { cn, getNetworkLogo } from "@/lib/utils";

export const isOnHyperliquid = (wallet: WalletConnected): boolean =>
  wallet.currentAccount.chain === EvmNetworks.HyperEVM;

interface NetworkSwitcherProps {
  wallet: WalletConnected;
  showChevron?: boolean;
  className?: string;
}

export const NetworkSwitcher = ({
  wallet,
  showChevron = true,
  className,
}: NetworkSwitcherProps) => {
  const [isNetworkDialogOpen, setIsNetworkDialogOpen] = useState(false);
  const { switchNetwork } = useAppKitNetwork();

  const currentNetwork =
    wallet.networks.find(
      (n) => n.skChainName === wallet.currentAccount.chain,
    ) ?? wallet.networks[0];

  const hasMultipleNetworks = wallet.networks.length > 1;

  const handleNetworkSelect = (
    network: AppKitNetwork & { skChainName: SupportedSKChains },
  ) => {
    switchNetwork(network);
    setIsNetworkDialogOpen(false);
  };

  return (
    <Dialog.Root
      open={isNetworkDialogOpen}
      onOpenChange={setIsNetworkDialogOpen}
    >
      <Dialog.Trigger
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-5/50 hover:bg-gray-5 transition-colors",
          hasMultipleNetworks && "cursor-pointer",
          !hasMultipleNetworks && "cursor-default",
          className,
        )}
        disabled={!hasMultipleNetworks}
      >
        <TokenIcon
          logoURI={getNetworkLogo(currentNetwork.skChainName)}
          name={currentNetwork.name}
          size="xs"
        />
        {showChevron && hasMultipleNetworks && (
          <ChevronDown className="size-4 text-gray-2" />
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Select Network</Dialog.Title>
            </Dialog.Header>

            <div className="flex flex-col gap-2 mt-4 max-h-[300px] overflow-y-auto">
              {wallet.networks.map((network) => {
                const isSelected =
                  network.skChainName === currentNetwork.skChainName;

                return (
                  <button
                    key={network.id}
                    type="button"
                    onClick={() => handleNetworkSelect(network)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                      "hover:bg-gray-5 cursor-pointer",
                      isSelected && "bg-gray-5",
                    )}
                  >
                    <TokenIcon
                      logoURI={getNetworkLogo(network.skChainName)}
                      name={network.name}
                    />

                    <div className="flex justify-between items-center gap-2 flex-1">
                      <span
                        className={cn(
                          "text-md font-medium tracking-tight text-foreground",
                        )}
                      >
                        {network.name}
                      </span>
                      {isSelected && (
                        <Check className="size-4 text-foreground shrink-0 ml-3" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

interface NetworkSwitchPromptProps {
  wallet: WalletConnected;
  onOpenChange: (open: boolean) => void;
  targetChain?: SupportedSKChains;
  title?: string;
  description?: string;
}

export const NetworkSwitchPrompt = ({
  wallet,
  onOpenChange,
  targetChain = EvmNetworks.HyperEVM,
  title = "Switch Network",
  description = "Please switch to Hyperliquid network to continue.",
}: NetworkSwitchPromptProps) => {
  const { switchNetwork } = useAppKitNetwork();

  const targetNetwork = wallet.networks.find(
    (n) => n.skChainName === targetChain,
  );

  const handleSwitch = () => {
    if (targetNetwork) {
      switchNetwork(targetNetwork);
      onOpenChange(false);
    }
  };

  if (!targetNetwork) return null;

  return (
    <Dialog.Root open onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>

            <p className="text-gray-2 text-sm mt-2">{description}</p>

            <div className="flex flex-col gap-3 mt-6">
              <button
                type="button"
                onClick={handleSwitch}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  "bg-gray-5 hover:bg-gray-5/80 cursor-pointer",
                )}
              >
                <TokenIcon
                  logoURI={getNetworkLogo(targetNetwork.skChainName)}
                  name={targetNetwork.name}
                />
                <span className="text-md font-medium tracking-tight text-foreground flex-1 text-left">
                  Switch to {targetNetwork.name}
                </span>
              </button>

              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
