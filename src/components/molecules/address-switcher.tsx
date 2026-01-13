import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Check, ChevronDown, Wallet } from "lucide-react";
import { useState } from "react";
import {
  WalletAction,
  walletAtom,
  writableWalletAtom,
} from "@/atoms/wallet-atom";
import { TokenIcon } from "@/components/molecules/token-icon";
import { Dialog } from "@/components/ui/dialog";
import type { WalletAccount } from "@/domain/wallet";
import {
  cn,
  formatNetworkName,
  getNetworkLogo,
  truncateAddress,
} from "@/lib/utils";

export const AddressSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));
  const setAddress = useAtomSet(writableWalletAtom);

  if (!wallet) return null;

  const hasMultipleAddresses = wallet.accounts.length > 1;

  const handleAddressSelect = (account: WalletAccount) => {
    setAddress(WalletAction.ChangeAccount(account));
    setIsOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-5/50 hover:bg-gray-5 transition-colors",
          hasMultipleAddresses && "cursor-pointer",
          !hasMultipleAddresses && "cursor-default",
        )}
        disabled={!hasMultipleAddresses}
      >
        <Wallet className="size-4 text-gray-2" />
        <span className="font-medium text-foreground tracking-tight">
          {truncateAddress(wallet.currentAccount.address)}
        </span>
        {hasMultipleAddresses && <ChevronDown className="size-4 text-gray-2" />}
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
                      isSelected && "bg-gray-5 ",
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
                        {formatNetworkName(account.chain)} |{" "}
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
  );
};
