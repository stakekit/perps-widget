import type { HttpClientError } from "@effect/platform";
import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { Data, type Effect, Schema, type Stream } from "effect";
import type { ParseError } from "effect/ParseResult";
import type {
  ActionDto,
  TransactionDto,
} from "@/services/api-client/api-schemas";
import type { SKClientError } from "@/services/api-client/client-factory";

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

export const WalletAccount = Schema.Struct({
  id: Schema.String,
  address: Schema.String.pipe(Schema.brand("WalletAccountAddress")),
});

export type WalletAccount = typeof WalletAccount.Type;

type BrowserWallet = { type: "browser"; wagmiAdapter: WagmiAdapter };
type LedgerWallet = { type: "ledger" };

type WalletBase = BrowserWallet | LedgerWallet;

export type WalletDisconnected = WalletBase & {
  status: "disconnected";
};

export type WalletConnected = WalletBase & {
  status: "connected";
  currentAccount: WalletAccount;
  accounts: WalletAccount[];
  switchAccount: (args: {
    account: WalletAccount;
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

export type Wallet = WalletDisconnected | WalletConnected;

export class DeserializeTransactionError extends Data.TaggedError(
  "DeserializeTransactionError",
)<{ cause: unknown }> {}

export class SignTransactionError extends Data.TaggedError(
  "SignTransactionError",
)<{
  cause: unknown;
}> {}

export class WalletNotConnectedError extends Data.TaggedError(
  "WalletNotConnectedError",
) {}

export class ChainNotFoundError extends Data.TaggedError(
  "ChainNotFoundError",
) {}

export class SwitchChainError extends Data.TaggedError("SwitchChainError")<{
  cause: unknown;
}> {}

export class SwitchAccountError extends Data.TaggedError("SwitchAccountError")<{
  cause: unknown;
}> {}

export const isWalletConnected = (
  wallet: Wallet | null,
): wallet is WalletConnected => wallet?.status === "connected";

export const isBrowserWallet = (
  wallet: Wallet | null,
): wallet is WalletConnected & BrowserWallet => wallet?.type === "browser";
