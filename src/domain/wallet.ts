import type { HttpClientError } from "@effect/platform";
import type { AppKitNetwork } from "@reown/appkit/networks";
import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { Data, type Effect, type Stream } from "effect";
import type { NonEmptyArray } from "effect/Array";
import type { ParseError } from "effect/ParseResult";
import type { SupportedSKChains } from "@/domain/chains";
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

export type WalletAccount = {
  id: string;
  address: string;
};

type WalletBase = {
  networks: NonEmptyArray<AppKitNetwork & { skChainName: SupportedSKChains }>;
  wagmiAdapter: WagmiAdapter;
};

export type WalletDisconnected = WalletBase & {
  status: "disconnected";
};

export type WalletConnected = WalletBase & {
  status: "connected";
  currentAccount: WalletAccount;
  accounts: WalletAccount[];
  signTransactions: (action: ActionDto) => Effect.Effect<
    {
      stream: Stream.Stream<SignTransactionsState, never, never>;
      startMachine: Effect.Effect<void, never, never>;
      state: SignTransactionsState;
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

export const isWalletConnected = (
  wallet: Wallet | null,
): wallet is WalletConnected => wallet?.status === "connected";
