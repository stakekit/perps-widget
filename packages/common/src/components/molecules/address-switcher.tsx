import { useAtomSet } from "@effect-atom/atom-react";
import { useDisconnect } from "@reown/appkit/react";
import { Match } from "effect";
import { Check, ChevronDown, Copy, LogOut, Wallet } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  switchBrowserAccountAtom,
  switchLedgerAccountAtom,
} from "../../atoms/wallet-atom";
import type {
  BrowserWalletConnected,
  LedgerWalletConnected,
} from "../../domain/wallet";
import {
  isBrowserWalletConnected,
  isLedgerWalletConnected,
  type WalletConnected,
} from "../../domain/wallet";
import { cn, truncateAddress } from "../../lib/utils";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Text } from "../ui/text";

const LedgerAccountList = ({
  wallet,
  onAccountSwitch,
}: {
  wallet: LedgerWalletConnected;
  onAccountSwitch: () => void;
}) => {
  const switchAccount = useAtomSet(switchLedgerAccountAtom(wallet));

  const handleAccountSwitch = (
    account: LedgerWalletConnected["accounts"][number],
  ) => {
    switchAccount({ account });
    onAccountSwitch();
  };

  return wallet.accounts.map((account) => {
    const currentAccount = wallet.currentAccount;
    const isCurrentAccount =
      account.address === currentAccount.address &&
      account.id === currentAccount.id;

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
          <div className="flex flex-col items-start gap-1">
            <Text as="span" variant="bodyXsGray2Medium">
              Account ID: {truncateAddress(account.id)}
            </Text>

            <Text as="span" variant="bodySmForegroundMedium">
              Address: {truncateAddress(account.address)}
            </Text>
          </div>
        </div>
        {isCurrentAccount && <Check className="size-4 text-green-500" />}
      </button>
    );
  });
};

const BrowserAccountList = ({
  wallet,
  onAccountSwitch,
}: {
  wallet: BrowserWalletConnected;
  onAccountSwitch: () => void;
}) => {
  const switchAccount = useAtomSet(switchBrowserAccountAtom(wallet));

  const handleAccountSwitch = (
    account: BrowserWalletConnected["accounts"][number],
  ) => {
    switchAccount({ account });
    onAccountSwitch();
  };

  return wallet.accounts.map((account) => {
    const isCurrentAccount = account.address === wallet.currentAccount.address;

    return (
      <button
        type="button"
        key={account.address}
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
          <Text as="span" variant="bodyBaseForegroundMedium">
            {truncateAddress(account.address)}
          </Text>
        </div>
        {isCurrentAccount && <Check className="size-4 text-green-500" />}
      </button>
    );
  });
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

      {isBrowserWalletConnected(wallet) && (
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

interface AddressSwitcherProps {
  wallet: WalletConnected;
  trigger?: React.ReactElement;
}

export const AddressSwitcher = ({ wallet, trigger }: AddressSwitcherProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          trigger ??
          ((props) => (
            <Button {...props} variant="secondary" className="self-center">
              <Wallet className="size-4 text-gray-2" />
              <Text as="span" variant="bodyBaseForegroundMediumTight">
                {truncateAddress(wallet.currentAccount.address)}
              </Text>
              <ChevronDown className="size-4 text-gray-2" />
            </Button>
          ))
        }
      />

      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Switch Account</Dialog.Title>
            </Dialog.Header>

            <div className="flex flex-col gap-2 mt-4 max-h-[300px] overflow-y-auto">
              {Match.value(wallet).pipe(
                Match.when(isLedgerWalletConnected, (w) => (
                  <LedgerAccountList
                    wallet={w}
                    onAccountSwitch={() => setOpen(false)}
                  />
                )),
                Match.orElse((w) => (
                  <BrowserAccountList
                    wallet={w}
                    onAccountSwitch={() => setOpen(false)}
                  />
                )),
              )}
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
