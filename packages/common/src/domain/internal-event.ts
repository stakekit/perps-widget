import type { Action } from "./action";
import type { ActionTransaction } from "./action-transaction";

export type LifecycleEventActionContext = {
  id: Action["id"];
  action: Action["action"];
  status: Action["status"];
};

export type LifecycleEventTransactionContext = {
  id: ActionTransaction["id"];
  type: ActionTransaction["type"];
  status: ActionTransaction["status"];
};

export type TransactionSigningStartedEvent = {
  type: "transaction.signing_started";
  action: LifecycleEventActionContext;
  transaction: LifecycleEventTransactionContext;
};

export type TransactionSubmittedEvent = {
  type: "transaction.submitted";
  action: LifecycleEventActionContext;
  transaction: LifecycleEventTransactionContext;
  result:
    | { type: "transactionHash"; transactionHash: string }
    | { type: "signedPayload"; signedPayload: string };
};

export type ActionCompletedEvent = {
  type: "action.completed";
  action: LifecycleEventActionContext;
};

export type ActionFailedEvent = {
  type: "action.failed";
  action: LifecycleEventActionContext;
  error: string;
};

export type LifecycleEvent =
  | TransactionSigningStartedEvent
  | TransactionSubmittedEvent
  | ActionCompletedEvent
  | ActionFailedEvent;

export const makeLifecycleActionContext = (
  action: Action,
): LifecycleEventActionContext => ({
  id: action.id,
  action: action.action,
  status: action.status,
});

export const makeLifecycleTransactionContext = (
  transaction: ActionTransaction,
): LifecycleEventTransactionContext => ({
  id: transaction.id,
  type: transaction.type,
  status: transaction.status,
});
