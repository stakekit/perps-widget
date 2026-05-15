import { useAtomValue } from "@effect/atom-react";
import { Navigate } from "@tanstack/react-router";
import type { transactionExecutionAtoms } from "@yieldxyz/perps-common/atoms";
import {
  Skeleton,
  TransactionProgress,
} from "@yieldxyz/perps-common/components";
import type { SignTransactionsState } from "@yieldxyz/perps-common/domain";
import * as Result from "effect/unstable/reactivity/AsyncResult";

interface SignTransactionsProps {
  state: SignTransactionsState;
}

function SignTransactionsWithState({ state }: SignTransactionsProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-xl font-semibold text-foreground tracking-tight">
        Progress
      </h2>

      <TransactionProgress state={state} />
    </div>
  );
}

export function SignTransactions({
  machineAtoms,
}: {
  machineAtoms: ReturnType<typeof transactionExecutionAtoms>;
}) {
  const { machineStreamAtom } = machineAtoms;
  const state = useAtomValue(machineStreamAtom);

  if (Result.isFailure(state)) {
    return (
      <>
        <Skeleton className="w-full h-full min-h-[200px]" />
        <Navigate to="/" />
      </>
    );
  }

  if (Result.isSuccess(state)) {
    return <SignTransactionsWithState state={state.value} />;
  }

  return <Skeleton className="w-full h-full min-h-[200px]" />;
}
