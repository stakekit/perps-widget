import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { Context, type Effect, type Stream } from "effect";
import type { Transaction, TransactionHash } from "@/domain/transactions";
import type {
  SignTransactionError,
  SwitchAccountError,
  WalletAccount,
} from "@/domain/wallet";

export type AccountsState =
  | { status: "disconnected" }
  | {
      status: "connected";
      currentAccount: WalletAccount;
      accounts: WalletAccount[];
    };

export class Signer extends Context.Tag("Signer")<
  Signer,
  {
    signTransaction: (args: {
      transaction: Transaction;
      account: WalletAccount;
    }) => Effect.Effect<TransactionHash, SignTransactionError>;
    switchAccount: (args: {
      account: WalletAccount;
    }) => Effect.Effect<void, SwitchAccountError>;
    accountsStream: Stream.Stream<AccountsState>;
    getAccountState: Effect.Effect<AccountsState>;
  } & (
    | {
        type: "browser";
        wagmiAdapter: WagmiAdapter;
      }
    | {
        type: "ledger";
      }
  )
>() {}
