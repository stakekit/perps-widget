import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { type Effect, Schema, type Stream } from "effect";
import { type ChainId, WalletAddress } from "./ids";
import {
  EIP712Tx,
  EvmTx,
  type SignedPayload,
  type TransactionHash,
} from "./transactions";
import type {
  WalletMissingCapabilityError,
  WalletSendTransactionError,
  WalletSignTypedDataError,
  WalletSwitchAccountError,
  WalletSwitchChainError,
} from "./wallet-errors";

export const WalletAdapterMode = Schema.Literals(["browser", "external"]);
export type WalletAdapterMode = typeof WalletAdapterMode.Type;

export const WalletAdapterAccount = Schema.Struct({
  address: WalletAddress,
  id: Schema.optionalKey(Schema.String),
  label: Schema.optionalKey(Schema.String),
});
export type WalletAdapterAccount = typeof WalletAdapterAccount.Type;

export const makeWalletAdapterAccount = Schema.decodeSync(WalletAdapterAccount);

export const DisconnectedWalletAdapterState = Schema.Struct({
  status: Schema.Literal("disconnected"),
});
export type DisconnectedWalletAdapterState =
  typeof DisconnectedWalletAdapterState.Type;

export const ConnectedWalletAdapterState = Schema.Struct({
  status: Schema.Literal("connected"),
  currentAccount: WalletAdapterAccount,
  accounts: Schema.NonEmptyArray(WalletAdapterAccount),
});
export type ConnectedWalletAdapterState =
  typeof ConnectedWalletAdapterState.Type;

export const WalletAdapterState = Schema.Union([
  DisconnectedWalletAdapterState,
  ConnectedWalletAdapterState,
]);
export type WalletAdapterState = typeof WalletAdapterState.Type;

export const EvmTransactionRequest = Schema.Struct({
  account: WalletAddress,
  transaction: EvmTx,
});
export type EvmTransactionRequest = typeof EvmTransactionRequest.Type;

export const TypedDataRequest = Schema.Struct({
  account: WalletAddress,
  transaction: EIP712Tx,
});
export type TypedDataRequest = typeof TypedDataRequest.Type;

type WalletAdapterCommon = {
  getState: () => WalletAdapterState;
  changes: Stream.Stream<WalletAdapterState>;
  sendTransaction: (
    request: EvmTransactionRequest,
  ) => Effect.Effect<
    TransactionHash,
    WalletSwitchChainError | WalletSendTransactionError
  >;
  signTypedData: (
    request: TypedDataRequest,
  ) => Effect.Effect<
    SignedPayload,
    WalletSwitchChainError | WalletSignTypedDataError
  >;
  switchAccount: (
    address: WalletAddress,
  ) => Effect.Effect<
    void,
    WalletMissingCapabilityError | WalletSwitchAccountError
  >;
  switchChain: (
    chainId: ChainId,
  ) => Effect.Effect<
    void,
    WalletMissingCapabilityError | WalletSwitchChainError
  >;
};

export type BrowserWalletAdapter = {
  mode: "browser";
  wagmiAdapter: WagmiAdapter;
} & WalletAdapterCommon;

export type ExternalWalletAdapter = {
  mode: "external";
} & WalletAdapterCommon;

export type PerpsWalletAdapter = BrowserWalletAdapter | ExternalWalletAdapter;
