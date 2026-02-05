import type { SignTransactionsState } from "@yieldxyz/perps-common/domain";
import { cn, formatSnakeCase } from "@yieldxyz/perps-common/lib";
import { Cause } from "effect";
import {
  CheckCircle2,
  FileSignature,
  Loader2,
  Radio,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardSection } from "../../ui/card";
import { Text } from "../../ui/text";

export interface TransactionProgressProps {
  state: SignTransactionsState;
  onRetry?: () => void;
  onClose?: () => void;
}

export function TransactionProgress({
  state,
  onRetry,
  onClose,
}: TransactionProgressProps) {
  const { transactions, currentTxIndex, step, error, isDone } = state;
  const totalTransactions = transactions.length;

  if (error) {
    console.log(Cause.pretty(Cause.fail(error.cause)));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between px-1">
        <Text as="p" variant="bodySmGray2">
          {isDone
            ? "All transactions complete"
            : `Transaction ${currentTxIndex + 1} of ${totalTransactions}`}
        </Text>
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
                <Text
                  as="p"
                  variant="labelSmSemibold"
                  className="text-accent-red"
                >
                  {getErrorDescription(error)}
                </Text>
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
          const isConfirmed =
            tx.status === "CONFIRMED" || tx.status === "BROADCASTED";

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
                    <Text
                      as="p"
                      variant="labelSmSemibold"
                      className="text-foreground"
                    >
                      {formatTransactionType(tx.type)}
                    </Text>
                    <Text as="p" variant="bodyXsGray2">
                      {formatSnakeCase(tx.network)}
                    </Text>
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

      {/* Action buttons */}
      <div className="flex gap-3">
        {error !== null && onRetry && (
          <Button variant="destructive" className="flex-1" onClick={onRetry}>
            <RotateCcw className="size-4" />
            Retry
          </Button>
        )}
        {(isDone || error !== null) && onClose && (
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
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
      <Text as="span" variant="badgePrimary">
        Confirmed
      </Text>
    );
  }

  if (status === "FAILED" || status === "NOT_FOUND") {
    return (
      <Text as="span" variant="badgeDestructive">
        Failed
      </Text>
    );
  }

  if (isFuture) {
    return (
      <Text as="span" variant="badgeNeutral">
        Pending
      </Text>
    );
  }

  if (step) {
    const stepLabels: Record<string, string> = {
      sign: "Signing...",
      submit: "Submitting...",
      check: "Confirming...",
    };

    return (
      <Text as="span" variant="badgePrimary">
        {stepLabels[step]}
      </Text>
    );
  }

  return (
    <Text as="span" variant="badgeNeutral">
      {status}
    </Text>
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
      <Text
        as="span"
        variant="bodySmMedium"
        className={cn(
          "ml-3 pt-2.5 transition-colors",
          status === "complete" && "text-primary",
          status === "active" && "text-foreground",
          status === "pending" && "text-gray-2",
        )}
      >
        {label}
      </Text>
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
    STOP_LOSS: "Update Stop Loss",
    TAKE_PROFIT: "Update Take Profit",
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
