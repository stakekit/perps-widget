import type { Schema } from "effect";
import { Data, type Effect } from "effect";
import type { HttpClientError } from "effect/unstable/http";
import type { SKClientError } from "../services/api-client/client-factory";
import type { Action } from "./action";
import type { ActionTransaction } from "./action-transaction";
import type {
  BrowserWalletAdapter,
  ExternalWalletAdapter,
  WalletAdapterAccount,
} from "./wallet-adapter";
import type {
  WalletMissingCapabilityError,
  WalletSendTransactionError,
  WalletSignTypedDataError,
  WalletSwitchAccountError,
  WalletSwitchChainError,
} from "./wallet-errors";

export class TransactionNotConfirmedError extends Data.TaggedError(
  "TransactionNotConfirmedError",
) {}

export class TransactionFailedError extends Data.TaggedError(
  "TransactionFailedError",
) {}

export type SignTransactionsState = {
  action: Action;
  transactions: readonly ActionTransaction[];
  currentTxIndex: number;
  error:
    | null
    | HttpClientError.HttpClientError
    | Schema.SchemaError
    | SKClientError<string, unknown>
    | WalletMissingCapabilityError
    | WalletSendTransactionError
    | WalletSignTypedDataError
    | WalletSwitchChainError
    | TransactionNotConfirmedError
    | TransactionFailedError;
  isDone: boolean;
} & (
  | {
      step: "sign" | null;
      txHash: null;
    }
  | {
      step: "submit" | "check";
      txHash: string;
    }
);

export type BrowserWalletDisconnected = {
  type: BrowserWalletAdapter["mode"];
  status: "disconnected";
};

export type ExternalWalletDisconnected = {
  type: ExternalWalletAdapter["mode"];
  status: "disconnected";
};

export type WalletDisconnected =
  | BrowserWalletDisconnected
  | ExternalWalletDisconnected;

export type WalletAccount = WalletAdapterAccount;

type WalletConnectedCommon<T extends WalletAccount> = {
  status: "connected";
  currentAccount: T;
  accounts: readonly T[];
  switchAccount: (args: {
    account: T;
  }) => Effect.Effect<
    void,
    WalletMissingCapabilityError | WalletSwitchAccountError
  >;
};

export type BrowserWalletConnected = Omit<
  BrowserWalletDisconnected,
  "status"
> & {
  status: "connected";
} & WalletConnectedCommon<WalletAccount>;

export type ExternalWalletConnected = Omit<
  ExternalWalletDisconnected,
  "status"
> & {
  status: "connected";
} & WalletConnectedCommon<WalletAccount>;

export type WalletConnected = BrowserWalletConnected | ExternalWalletConnected;

export type Wallet = WalletDisconnected | WalletConnected;

export const isWalletConnected = (
  wallet: Wallet | null,
): wallet is WalletConnected => wallet?.status === "connected";

export const isBrowserWallet = (wallet: Wallet | null) =>
  wallet?.type === "browser";

export const isBrowserWalletConnected = (
  wallet: Wallet | null,
): wallet is BrowserWalletConnected =>
  isWalletConnected(wallet) && wallet.type === "browser";
