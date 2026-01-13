import { Data, type Effect } from "effect";
import type { ParseError } from "effect/ParseResult";
import type { SupportedSKChains } from "@/domain/chains";
import type { TransactionDto } from "@/services/api-client/api-schemas";

export type WalletAccount = {
  id: string;
  address: string;
  chain: SupportedSKChains;
};

export type Wallet = {
  currentAccount: WalletAccount;
  accounts: WalletAccount[];
  signTransaction: (args: {
    account: WalletAccount;
    tx: NonNullable<TransactionDto["signablePayload"]>;
  }) => Effect.Effect<
    string,
    ParseError | DeserializeTransactionError | SignTransactionError,
    never
  >;
};

export class DeserializeTransactionError extends Data.TaggedError(
  "DeserializeTransactionError",
)<{ cause: unknown }> {}

export class SignTransactionError extends Data.TaggedError(
  "SignTransactionError",
)<{
  cause: unknown;
}> {}
