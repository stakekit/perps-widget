import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { Data, type Effect, Schema, type Stream } from "effect";
import type { Transaction, TransactionHash } from "./transactions";

export const WalletAccountAddress = Schema.String.pipe(
  Schema.brand("WalletAccountAddress"),
);

const BrowserWalletAccount = Schema.Struct({
  address: WalletAccountAddress,
}).pipe(Schema.attachPropertySignature("_kind", "browserWalletAccount"));

const LedgerWalletAccount = Schema.Struct({
  id: Schema.String.pipe(Schema.brand("WalletAccountId")),
  address: WalletAccountAddress,
}).pipe(Schema.attachPropertySignature("_kind", "ledgerWalletAccount"));

export const makeBrowserWalletAccount = Schema.decodeSync(BrowserWalletAccount);
export const makeLedgerWalletAccount = Schema.decodeSync(LedgerWalletAccount);

export type BrowserWalletAccount = typeof BrowserWalletAccount.Type;
export type LedgerWalletAccount = typeof LedgerWalletAccount.Type;

export const WalletAccount = Schema.Union(
  BrowserWalletAccount,
  LedgerWalletAccount,
);

export type WalletAccount = typeof WalletAccount.Type;

export type AccountsState<T extends WalletAccount> =
  | { status: "disconnected" }
  | {
      status: "connected";
      currentAccount: T;
      accounts: T[];
    };

type SignerCommon<T extends WalletAccount> = {
  signTransaction: (args: {
    transaction: Transaction;
  }) => Effect.Effect<TransactionHash, SignTransactionError | SwitchChainError>;
  switchAccount: (args: {
    account: T;
  }) => Effect.Effect<void, SwitchAccountError>;
  accountsStream: Stream.Stream<AccountsState<T>>;
  getAccountState: Effect.Effect<AccountsState<T>>;
};

export type BrowserSigner = {
  type: "browser";
  wagmiAdapter: WagmiAdapter;
} & SignerCommon<BrowserWalletAccount>;

export type LedgerSigner = {
  type: "ledger";
} & SignerCommon<LedgerWalletAccount>;

export type Signer = BrowserSigner | LedgerSigner;

export class SwitchAccountError extends Data.TaggedError("SwitchAccountError")<{
  cause: unknown;
}> {}

export class SignTransactionError extends Data.TaggedError(
  "SignTransactionError",
)<{
  cause: unknown;
}> {}

export class SwitchChainError extends Data.TaggedError("SwitchChainError")<{
  cause: unknown;
}> {}
