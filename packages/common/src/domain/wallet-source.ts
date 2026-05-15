import type { ChainId, WalletAddress } from "./ids";
import type { SignedPayload, TransactionHash } from "./transactions";
import type {
  EvmTransactionRequest,
  TypedDataRequest,
  WalletAdapterState,
} from "./wallet-adapter";

export type WalletAdapterStateEncoded = typeof WalletAdapterState.Encoded;
export type TransactionHashEncoded = typeof TransactionHash.Encoded;
export type SignedPayloadEncoded = typeof SignedPayload.Encoded;
export type ChainIdEncoded = typeof ChainId.Encoded;
export type WalletAddressEncoded = typeof WalletAddress.Encoded;
export type TypedDataRequestEncoded = typeof TypedDataRequest.Encoded;
export type EvmTransactionRequestEncoded = typeof EvmTransactionRequest.Encoded;

export type ExternalWalletSource = {
  getState: () => WalletAdapterStateEncoded;
  subscribe: (
    listener: (state: WalletAdapterStateEncoded) => void,
  ) => () => void;
  sendTransaction: (
    request: EvmTransactionRequestEncoded,
  ) => Promise<TransactionHashEncoded>;
  signTypedData: (
    request: TypedDataRequestEncoded,
  ) => Promise<SignedPayloadEncoded>;
  switchAccount?: (address: WalletAddressEncoded) => Promise<void>;
  switchChain?: (chainId: ChainIdEncoded) => Promise<void>;
};
