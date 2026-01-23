import { useAtomSet } from "@effect-atom/atom-react";
import { useDisconnect } from "@reown/appkit/react";
import { Check, ChevronDown, Copy, LogOut, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { switchAccountAtom } from "@/atoms/wallet-atom";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { isBrowserWallet, type WalletConnected } from "@/domain/wallet";
import { cn, truncateAddress } from "@/lib/utils";

export const AddressSwitcher = ({ wallet }: { wallet: WalletConnected }) => {
  const [open, setOpen] = useState(false);
  const switchAccount = useAtomSet(switchAccountAtom(wallet));

  const handleAccountSwitch = (account: (typeof wallet.accounts)[number]) => {
    switchAccount({ account });
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={(props) => (
          <Button
            {...props}
            variant="secondary"
            size="lg"
            className="px-4 self-center"
          >
            <Wallet className="size-4 text-gray-2" />
            <span className="font-medium text-foreground tracking-tight">
              {truncateAddress(wallet.currentAccount.address)}
            </span>
            <ChevronDown className="size-4 text-gray-2" />
          </Button>
        )}
      />

      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Switch Account</Dialog.Title>
            </Dialog.Header>

            <div className="flex flex-col gap-2 mt-4 max-h-[300px] overflow-y-auto">
              {wallet.accounts.map((account) => {
                const isCurrentAccount =
                  account.address === wallet.currentAccount.address &&
                  account.id === wallet.currentAccount.id;

                return (
                  <button
                    type="button"
                    key={account.id}
                    onClick={() => handleAccountSwitch(account)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer",
                      "hover:bg-gray-5",
                      isCurrentAccount && "bg-gray-5",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-gray-4 flex items-center justify-center">
                        <Wallet className="size-4 text-gray-2" />
                      </div>
                      <span className="font-medium text-foreground">
                        {truncateAddress(account.address)}
                      </span>
                    </div>
                    {isCurrentAccount && (
                      <Check className="size-4 text-green-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <WalletActions
              wallet={wallet}
              address={wallet.currentAccount.address}
              onDisconnect={() => setOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const CopyButton = ({
  copied,
  onCopy,
}: {
  copied: boolean;
  onCopy: () => void;
}) => {
  return (
    <Button
      className="flex-1 relative overflow-hidden"
      variant="secondary"
      onClick={onCopy}
    >
      <span className="relative flex items-center gap-2">
        <span className="relative size-4">
          <Check
            className={cn(
              "size-4 text-green-500 absolute inset-0 transition-all duration-300 ease-out",
              copied
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 -rotate-90",
            )}
          />
          <Copy
            className={cn(
              "size-4 absolute inset-0 transition-all duration-300 ease-out",
              copied
                ? "opacity-0 scale-50 rotate-90"
                : "opacity-100 scale-100 rotate-0",
            )}
          />
        </span>
        <span
          className={cn(
            "transition-all duration-300",
            copied && "text-green-500",
          )}
        >
          {copied ? "Copied!" : "Copy Address"}
        </span>
      </span>

      {/* Ripple effect */}
      <span
        className={cn(
          "absolute inset-0 bg-green-500/20 rounded-xl",
          copied
            ? "scale-100 opacity-0 transition-all duration-500 ease-out"
            : "scale-0 opacity-100 transition-none",
        )}
      />
    </Button>
  );
};

const WalletActions = ({
  address,
  onDisconnect,
  wallet,
}: {
  wallet: WalletConnected;
  address: string;
  onDisconnect: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);

    if (copied) return;

    setCopied(true);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Dialog.Footer className="mt-4 pt-4 border-t border-gray-5 gap-2">
      <CopyButton copied={copied} onCopy={handleCopyAddress} />

      {isBrowserWallet(wallet) && (
        <DisconnectButton onDisconnect={onDisconnect} />
      )}
    </Dialog.Footer>
  );
};

const DisconnectButton = ({ onDisconnect }: { onDisconnect: () => void }) => {
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
    onDisconnect();
  };

  return (
    <Button className="flex-1" variant="destructive" onClick={handleDisconnect}>
      <LogOut className="size-4" />
      Disconnect
    </Button>
  );
};
