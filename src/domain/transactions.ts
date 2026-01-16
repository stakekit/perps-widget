import { Schema } from "effect";

const EvmTxSchema = Schema.Struct(
  { chainId: Schema.Number },
  {
    key: Schema.String,
    value: Schema.Unknown,
  },
);

export const EIP712TxSchema = Schema.Struct({
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

export const TransactionSchema = Schema.Union(EvmTxSchema, EIP712TxSchema);
