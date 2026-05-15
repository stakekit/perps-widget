import { Schema } from "effect";
import { LowercaseString } from "./scalars";

export const ProviderId = Schema.String.pipe(Schema.brand("ProviderId"));
export type ProviderId = typeof ProviderId.Type;

export const MarketId = Schema.String.pipe(Schema.brand("MarketId"));
export type MarketId = typeof MarketId.Type;

export const ActionId = Schema.String.pipe(Schema.brand("ActionId"));
export type ActionId = typeof ActionId.Type;

export const TransactionId = Schema.String.pipe(Schema.brand("TransactionId"));
export type TransactionId = typeof TransactionId.Type;

export const EventId = Schema.String.pipe(Schema.brand("EventId"));
export type EventId = typeof EventId.Type;

export const ChainId = Schema.String.pipe(Schema.brand("ChainId"));
export type ChainId = typeof ChainId.Type;

export const WalletAddress = Schema.TemplateLiteral([
  Schema.Literal("0x"),
  Schema.String,
]).pipe(Schema.brand("WalletAddress"));
export type WalletAddress = typeof WalletAddress.Type;

export const TokenAddress = LowercaseString.pipe(Schema.brand("TokenAddress"));
export type TokenAddress = typeof TokenAddress.Type;

export const ProviderOrderId = Schema.String.pipe(
  Schema.brand("ProviderOrderId"),
);
export type ProviderOrderId = typeof ProviderOrderId.Type;
