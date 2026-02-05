import type { HttpClientError } from "@effect/platform";
import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { Data, type Effect, type Stream } from "effect";
import type { ParseError } from "effect/ParseResult";
import type {
  ActionDto,
  TransactionDto,
} from "../services/api-client/api-schemas";
import type { SKClientError } from "../services/api-client/client-factory";
import type {
  BrowserSigner,
  BrowserWalletAccount,
  LedgerSigner,
  LedgerWalletAccount,
  SignTransactionError,
  SwitchAccountError,
  WalletAccount,
} from "./signer";

export class TransactionNotConfirmedError extends Data.TaggedError(
  "TransactionNotConfirmedError",
) {}

export class TransactionFailedError extends Data.TaggedError(
  "TransactionFailedError",
) {}

export type SignTransactionsState = {
  action: ActionDto;
  transactions: readonly TransactionDto[];
  currentTxIndex: number;
  error:
    | null
    | HttpClientError.HttpClientError
    | ParseError
    // biome-ignore lint/suspicious/noExplicitAny: any is fine here
    | SKClientError<any, unknown>
    | DeserializeTransactionError
    | SignTransactionError
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
  type: BrowserSigner["type"];
  wagmiAdapter: WagmiAdapter;
  status: "disconnected";
};

export type LedgerWalletDisconnected = {
  type: LedgerSigner["type"];
  status: "disconnected";
};

export type WalletDisconnected =
  | BrowserWalletDisconnected
  | LedgerWalletDisconnected;

type WalletConnectedCommon<T extends WalletAccount> = {
  status: "connected";
  currentAccount: T;
  accounts: T[];
  switchAccount: (args: {
    account: T;
  }) => Effect.Effect<void, SwitchAccountError>;
  signTransactions: (action: ActionDto) => Effect.Effect<
    {
      stream: Stream.Stream<SignTransactionsState, never, never>;
      retry: Effect.Effect<void, never, never>;
    },
    never,
    never
  >;
};

// Connected wallet types
export type BrowserWalletConnected = Omit<
  BrowserWalletDisconnected,
  "status"
> & { status: "connected" } & WalletConnectedCommon<BrowserWalletAccount>;

export type LedgerWalletConnected = Omit<LedgerWalletDisconnected, "status"> & {
  status: "connected";
} & WalletConnectedCommon<LedgerWalletAccount>;

export type WalletConnected = BrowserWalletConnected | LedgerWalletConnected;

export type Wallet = WalletDisconnected | WalletConnected;

export class DeserializeTransactionError extends Data.TaggedError(
  "DeserializeTransactionError",
)<{ cause: unknown }> {}

export const isWalletConnected = (
  wallet: Wallet | null,
): wallet is WalletConnected => wallet?.status === "connected";

export const isBrowserWallet = (wallet: Wallet | null) =>
  wallet?.type === "browser";

export const isBrowserWalletConnected = (
  wallet: Wallet | null,
): wallet is BrowserWalletConnected =>
  isWalletConnected(wallet) && wallet.type === "browser";

export const isLedgerWalletConnected = (
  wallet: Wallet | null,
): wallet is LedgerWalletConnected =>
  isWalletConnected(wallet) && wallet.type === "ledger";

export type { WalletAccount } from "./signer";
