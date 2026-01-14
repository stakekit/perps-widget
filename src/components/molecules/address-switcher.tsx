import { useAtomSet } from "@effect-atom/atom-react";
import { useDisconnect } from "@reown/appkit/react";
import { Check, ChevronDown, Copy, Wallet, X } from "lucide-react";
import { useState } from "react";
import { changeAccountAtom } from "@/atoms/wallet-atom";
import { NetworkSwitcher } from "@/components/molecules/network-switcher";
import { TokenIcon } from "@/components/molecules/token-icon";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { WalletAccount, WalletConnected } from "@/domain/wallet";
import {
  cn,
  formatSnakeCase,
  getNetworkLogo,
  truncateAddress,
} from "@/lib/utils";

export const AddressSwitcher = ({ wallet }: { wallet: WalletConnected }) => {
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const setAddress = useAtomSet(changeAccountAtom(wallet));

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const { disconnect } = useDisconnect();

  const hasMultipleAddresses = wallet.accounts.length > 1;

  const handleAddressSelect = (account: WalletAccount) => {
    setAddress(account);
    setIsAddressDialogOpen(false);
  };

  return (
    <div className="flex justify-between items-center gap-2">
      {/* Network Switcher */}
      <NetworkSwitcher wallet={wallet} />

      {/* Address Switcher */}
      <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-5/50">
        <Dialog.Root
          open={isAddressDialogOpen}
          onOpenChange={setIsAddressDialogOpen}
        >
          <Dialog.Trigger
            className={cn(
              "flex items-center gap-2 transition-colors text-pink-50",
              hasMultipleAddresses && "cursor-pointer hover:text-foreground/80",
              !hasMultipleAddresses && "cursor-default",
            )}
            disabled={!hasMultipleAddresses}
          >
            <Wallet className="size-4 text-gray-2" />
            <span className="font-medium text-foreground tracking-tight">
              {truncateAddress(wallet.currentAccount.address)}
            </span>
            {hasMultipleAddresses && (
              <ChevronDown className="size-4 text-gray-2" />
            )}
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Select Address</Dialog.Title>
                </Dialog.Header>

                <div className="flex flex-col gap-2 mt-4 max-h-[300px] overflow-y-auto">
                  {wallet.accounts.map((account) => {
                    const isSelected =
                      account.address === wallet.currentAccount.address &&
                      account.chain === wallet.currentAccount.chain;

                    return (
                      <button
                        key={`${account.chain}-${account.address}`}
                        type="button"
                        onClick={() => handleAddressSelect(account)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                          "hover:bg-gray-5 cursor-pointer",
                          isSelected && "bg-gray-5",
                        )}
                      >
                        <TokenIcon
                          logoURI={getNetworkLogo(account.chain)}
                          name={account.chain}
                        />

                        <div className="flex justify-between items-center gap-2 flex-1">
                          <span
                            className={cn(
                              "text-md font-medium tracking-tight text-foreground",
                            )}
                          >
                            {formatSnakeCase(account.chain)} |{" "}
                            {truncateAddress(account.address)}
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

        <button
          type="button"
          onClick={() => copyAddress(wallet.currentAccount.address)}
          className="p-1 hover:bg-gray-4 rounded transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <Copy className="size-3.5 text-gray-2 hover:text-foreground" />
          )}
        </button>
      </div>

      {/* Disconnect Button */}
      <Button
        size="icon"
        className="bg-transparent text-foreground hover:bg-transparent hover:cursor-pointer"
        onClick={() => disconnect()}
      >
        <X className="size-6" />
      </Button>
    </div>
  );
};
