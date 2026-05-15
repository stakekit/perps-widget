import { useAtomSet, useAtomValue } from "@effect/atom-react";
import {
  actionAtom,
  transactionExecutionAtoms,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  Dialog,
  Skeleton,
  TransactionProgress,
} from "@yieldxyz/perps-common/components";
import { isWalletConnected } from "@yieldxyz/perps-common/domain";
import * as Result from "effect/unstable/reactivity/AsyncResult";

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

  if (!action) {
    return null;
  }

  const machineAtoms = transactionExecutionAtoms(action);

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
  machineAtoms: ReturnType<typeof transactionExecutionAtoms>;
  onClose: () => void;
}

function SignTransactionsContent({
  machineAtoms,
  onClose,
}: SignTransactionsContentProps) {
  const { machineStreamAtom } = machineAtoms;
  const state = useAtomValue(machineStreamAtom);

  if (Result.isFailure(state)) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="w-full h-[200px]" />
      </div>
    );
  }

  if (Result.isSuccess(state)) {
    return <TransactionProgress state={state.value} onClose={onClose} />;
  }

  return <Skeleton className="w-full h-[200px]" />;
}
