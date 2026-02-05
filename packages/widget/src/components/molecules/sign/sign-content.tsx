import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Navigate } from "@tanstack/react-router";
import type { signActionAtoms } from "@yieldxyz/perps-common/atoms";
import {
  Skeleton,
  TransactionProgress,
} from "@yieldxyz/perps-common/components";
import type { SignTransactionsState } from "@yieldxyz/perps-common/domain";

interface SignTransactionsProps {
  state: SignTransactionsState;
  retry: () => void;
}

function SignTransactionsWithState({ state, retry }: SignTransactionsProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-xl font-semibold text-foreground tracking-tight">
        Progress
      </h2>

      <TransactionProgress state={state} onRetry={() => retry()} />
    </div>
  );
}

export function SignTransactions({
  machineAtoms,
}: {
  machineAtoms: ReturnType<typeof signActionAtoms>;
}) {
  const { machineStreamAtom, retryMachineAtom } = machineAtoms;
  const state = useAtomValue(machineStreamAtom);
  const retry = useAtomSet(retryMachineAtom);

  const result = Result.all({ state, retry });

  if (Result.isFailure(result)) {
    return (
      <>
        <Skeleton className="w-full h-full min-h-[200px]" />
        <Navigate to="/" />
      </>
    );
  }

  if (Result.isSuccess(result)) {
    return (
      <SignTransactionsWithState
        state={result.value.state}
        retry={result.value.retry}
      />
    );
  }

  return <Skeleton className="w-full h-full min-h-[200px]" />;
}
