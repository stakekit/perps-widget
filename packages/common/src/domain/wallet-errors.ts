import { Data } from "effect";

export class WalletMissingCapabilityError extends Data.TaggedError(
  "WalletMissingCapabilityError",
)<{
  capability: "switchAccount" | "switchChain";
}> {}

export class WalletSendTransactionError extends Data.TaggedError(
  "WalletSendTransactionError",
)<{
  reason: unknown;
}> {}

export class WalletSignTypedDataError extends Data.TaggedError(
  "WalletSignTypedDataError",
)<{
  reason: unknown;
}> {}

export class WalletSwitchAccountError extends Data.TaggedError(
  "WalletSwitchAccountError",
)<{
  reason: unknown;
}> {}

export class WalletSwitchChainError extends Data.TaggedError(
  "WalletSwitchChainError",
)<{
  reason: unknown;
}> {}
