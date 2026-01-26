import { Schema } from "effect";

const HexString = Schema.TemplateLiteral(Schema.Literal("0x"), Schema.String);

export const EvmTx = Schema.Struct({
  from: Schema.String,
  to: HexString,
  data: HexString,
  value: Schema.optional(Schema.BigInt),
  maxFeePerGas: Schema.optional(Schema.BigInt),
  maxPriorityFeePerGas: Schema.optional(Schema.BigInt),
  gasLimit: Schema.BigInt,
  nonce: Schema.Number,
  chainId: Schema.Number,
});

export const EIP712Tx = Schema.Struct({
  domain: Schema.Struct(
    { chainId: Schema.Number },
    {
      key: Schema.String,
      value: Schema.Unknown,
    },
  ),
  types: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  message: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  primaryType: Schema.String,
});

export const Transaction = Schema.Union(EvmTx, EIP712Tx);

export type Transaction = typeof Transaction.Type;

export const TransactionHash = Schema.String.pipe(
  Schema.brand("TransactionHash"),
);

export type TransactionHash = typeof TransactionHash.Type;
