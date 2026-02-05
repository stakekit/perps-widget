import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import {
  actionAtom,
  signActionAtoms,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  Dialog,
  Skeleton,
  TransactionProgress,
} from "@yieldxyz/perps-common/components";
import { isWalletConnected } from "@yieldxyz/perps-common/domain";

export function SignTransactionsDialog() {
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));
  const action = useAtomValue(actionAtom);
  const setAction = useAtomSet(actionAtom);

  const isOpen = action !== null && isWalletConnected(wallet);

  const handleClose = () => {
    setAction(null);
  };

  if (!isWalletConnected(wallet)) {
    return null;
  }

  const machineAtoms = signActionAtoms(wallet.signTransactions);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Transaction Progress</Dialog.Title>
            </Dialog.Header>

            <SignTransactionsContent
              machineAtoms={machineAtoms}
              onClose={handleClose}
            />
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface SignTransactionsContentProps {
  machineAtoms: ReturnType<typeof signActionAtoms>;
  onClose: () => void;
}

function SignTransactionsContent({
  machineAtoms,
  onClose,
}: SignTransactionsContentProps) {
  const { machineStreamAtom, retryMachineAtom } = machineAtoms;
  const state = useAtomValue(machineStreamAtom);
  const retry = useAtomSet(retryMachineAtom);

  const result = Result.all({ state, retry });

  if (Result.isFailure(result)) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="w-full h-[200px]" />
      </div>
    );
  }

  if (Result.isSuccess(result)) {
    return (
      <TransactionProgress
        state={result.value.state}
        onRetry={result.value.retry}
        onClose={onClose}
      />
    );
  }

  return <Skeleton className="w-full h-[200px]" />;
}
