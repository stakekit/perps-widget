import type { Atom } from "@effect-atom/atom-react";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import {
  CheckCircle2,
  ExternalLink,
  FileSignature,
  Loader2,
  Radio,
  Send,
  XCircle,
} from "lucide-react";
import { Card, CardSection } from "@/components/ui/card";
import { cn, formatNetworkName } from "@/lib/utils";
import type { SignTransactionsState } from "@/services/wallet-service";

type SignTransactionsAtom = Atom.Atom<
  Result.Result<SignTransactionsState, unknown>
>;

interface SignTransactionsProps {
  atom: SignTransactionsAtom;
  title?: string;
}

export function SignTransactions({
  atom,
  title = "Sign Transactions",
}: SignTransactionsProps) {
  const state = useAtomValue(atom);

  console.log({ state });

  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-xl font-semibold text-foreground tracking-tight">
        {title}
      </h2>

      {Result.isWaiting(state) && <SignTransactionsLoading />}

      {Result.isSuccess(state) && (
        <SignTransactionsContent state={state.value} />
      )}
    </div>
  );
}

function SignTransactionsLoading() {
  return (
    <Card>
      <CardSection position="only">
        <div className="flex items-center gap-3 py-4">
          <Loader2 className="size-5 text-primary animate-spin" />
          <p className="text-sm text-gray-2">Preparing transactions...</p>
        </div>
      </CardSection>
    </Card>
  );
}

function SignTransactionsContent({ state }: { state: SignTransactionsState }) {
  const { transactions, currentTxIndex, step, error, isDone } = state;
  const totalTransactions = transactions.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-2">
          {isDone
            ? "All transactions complete"
            : `Transaction ${currentTxIndex + 1} of ${totalTransactions}`}
        </p>
        {totalTransactions > 1 && (
          <div className="flex gap-1">
            {transactions.map((tx, idx) => (
              <div
                key={tx.id}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  idx < currentTxIndex
                    ? "bg-primary"
                    : idx === currentTxIndex && step !== null
                      ? "bg-primary/50"
                      : idx === currentTxIndex && isDone
                        ? "bg-primary"
                        : "bg-gray-3",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Error display */}
      {error !== null && (
        <Card>
          <CardSection position="only">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-full bg-destructive/10">
                <XCircle className="size-5 text-accent-red" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-accent-red">
                  {getErrorDescription(error)}
                </p>
              </div>
            </div>
          </CardSection>
        </Card>
      )}

      {/* Transaction list */}
      <Card>
        {transactions.map((tx, idx) => {
          const isCurrentTx = idx === currentTxIndex;
          const isFutureTx = idx > currentTxIndex;
          const txStep = isCurrentTx ? step : null;
          const isConfirmed = tx.status === "CONFIRMED";

          return (
            <CardSection
              key={tx.id}
              position={
                totalTransactions === 1
                  ? "only"
                  : idx === 0
                    ? "first"
                    : idx === totalTransactions - 1
                      ? "last"
                      : "middle"
              }
            >
              <div className="flex flex-col gap-3">
                {/* Transaction header */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      {formatTransactionType(tx.type)}
                    </p>
                    <p className="text-xs text-gray-2">
                      {formatNetworkName(tx.network)}
                    </p>
                  </div>
                  <TransactionStatusBadge
                    status={tx.status}
                    step={txStep}
                    isFuture={isFutureTx}
                  />
                </div>

                {/* Current transaction steps - Vertical progress bar */}
                {isCurrentTx && !isConfirmed && (
                  <div className="flex flex-col">
                    <VerticalProgressStep
                      label="Sign transaction"
                      status={getStepStatus("sign", txStep)}
                      icon={FileSignature}
                      isLast={false}
                      error={!!error && txStep === "sign"}
                    />
                    <VerticalProgressStep
                      label="Submit to network"
                      status={getStepStatus("submit", txStep)}
                      icon={Send}
                      isLast={false}
                      error={!!error && txStep === "submit"}
                    />
                    <VerticalProgressStep
                      label="Waiting for confirmation"
                      status={getStepStatus("check", txStep)}
                      icon={Radio}
                      isLast={true}
                      error={!!error && txStep === "check"}
                    />
                  </div>
                )}
              </div>
            </CardSection>
          );
        })}
      </Card>

      {/* Completed transactions with hashes */}
      {isDone && (
        <Card>
          <CardSection position="only">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
                  <CheckCircle2 className="size-5 text-primary" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    All Transactions Confirmed
                  </p>
                  <p className="text-xs text-gray-2">
                    {totalTransactions} transaction
                    {totalTransactions > 1 ? "s" : ""} completed successfully
                  </p>
                </div>
              </div>

              {/* Transaction hashes */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-2 uppercase tracking-wider">
                  Transaction Hashes
                </p>
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-2 p-3 bg-background rounded-xl"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-xs text-gray-2">
                        {formatTransactionType(tx.type)}
                      </p>
                      <p className="text-sm font-mono text-foreground truncate">
                        {tx.id}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex items-center justify-center size-8 rounded-lg bg-gray-3 hover:bg-gray-3/80 transition-colors shrink-0"
                      onClick={() => {
                        // In a real app, this would link to a block explorer
                        navigator.clipboard.writeText(tx.id);
                      }}
                      title="Copy transaction ID"
                    >
                      <ExternalLink className="size-4 text-gray-2" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardSection>
        </Card>
      )}
    </div>
  );
}

function TransactionStatusBadge({
  status,
  step,
  isFuture,
}: {
  status: string;
  step: "sign" | "submit" | "check" | null;
  isFuture: boolean;
}) {
  if (status === "CONFIRMED") {
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
        Confirmed
      </span>
    );
  }

  if (status === "FAILED" || status === "NOT_FOUND") {
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-destructive/10 text-destructive">
        Failed
      </span>
    );
  }

  if (isFuture) {
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-3 text-gray-2">
        Pending
      </span>
    );
  }

  if (step) {
    const stepLabels: Record<string, string> = {
      sign: "Signing...",
      submit: "Submitting...",
      check: "Confirming...",
    };

    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
        {stepLabels[step]}
      </span>
    );
  }

  return (
    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-3 text-gray-2">
      {status}
    </span>
  );
}

type StepStatus = "pending" | "active" | "complete";

function VerticalProgressStep({
  label,
  status,
  icon: Icon,
  isLast,
  error,
}: {
  error: boolean;
  label: string;
  status: StepStatus;
  icon: typeof FileSignature;
  isLast: boolean;
}) {
  return (
    <div className="flex">
      {/* Icon and vertical bar column */}
      <div className="flex flex-col items-center">
        {/* Icon circle */}
        <div
          className={cn(
            "flex items-center justify-center size-10 rounded-full transition-colors shrink-0",
            status === "complete" && "bg-primary/10",
            status === "active" && "bg-primary/10",
            status === "pending" && "bg-gray-3",
          )}
        >
          {error ? (
            <XCircle className="size-5 text-accent-red" />
          ) : status === "complete" ? (
            <CheckCircle2 className="size-5 text-primary" />
          ) : status === "active" ? (
            <Loader2 className="size-5 text-primary animate-spin" />
          ) : (
            <Icon className="size-5 text-gray-2" />
          )}
        </div>
        {/* Vertical connecting bar */}
        {!isLast && (
          <div
            className={cn(
              "w-0.5 h-6 transition-colors",
              status === "complete" ? "bg-primary" : "bg-gray-3",
            )}
          />
        )}
      </div>
      {/* Label on the right */}
      <span
        className={cn(
          "text-sm font-medium ml-3 pt-2.5 transition-colors",
          status === "complete" && "text-primary",
          status === "active" && "text-foreground",
          status === "pending" && "text-gray-2",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function getStepStatus(
  targetStep: "sign" | "submit" | "check",
  currentStep: "sign" | "submit" | "check" | null,
): StepStatus {
  const stepOrder = ["sign", "submit", "check"];
  const targetIndex = stepOrder.indexOf(targetStep);
  const currentIndex = currentStep ? stepOrder.indexOf(currentStep) : -1;

  if (currentIndex > targetIndex) {
    return "complete";
  }
  if (currentIndex === targetIndex) {
    return "active";
  }
  return "pending";
}

function formatTransactionType(type: string): string {
  const typeMap: Record<string, string> = {
    APPROVAL: "Token Approval",
    OPEN_POSITION: "Open Position",
    CLOSE_POSITION: "Close Position",
    UPDATE_LEVERAGE: "Update Leverage",
    STOP_LOSS: "Set Stop Loss",
    TAKE_PROFIT: "Set Take Profit",
    CANCEL_ORDER: "Cancel Order",
    FUND: "Fund Account",
    WITHDRAW: "Withdraw",
  };

  return typeMap[type] || type;
}

function getErrorDescription(error: SignTransactionsState["error"]): string {
  if (error === null) return "";

  if ("_tag" in error) {
    const errorDescriptions: Record<string, string> = {
      TransactionNotConfirmedError: "Transaction not confirmed",
      TransactionFailedError: "Transaction failed",
      DeserializeTransactionError: "Failed to deserialize transaction",
      SignTransactionError: "Failed to sign transaction",
      ResponseError: "Network request failed",
      RequestError: "Failed to send request",
      ParseError: "Failed to parse response",
    };

    return errorDescriptions[error._tag] || "An error occurred";
  }

  return "An error occurred";
}
