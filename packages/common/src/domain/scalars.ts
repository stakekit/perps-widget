import { Schema, SchemaTransformation } from "effect";

export const NumberFromString = Schema.NumberFromString;
export type NumberFromString = typeof NumberFromString.Type;

export const BigIntFromString = Schema.String.pipe(
  Schema.decodeTo(Schema.BigInt, SchemaTransformation.bigintFromString),
);
export type BigIntFromString = typeof BigIntFromString.Type;

export const LowercaseString = Schema.String.pipe(
  Schema.decode(SchemaTransformation.toLowerCase()),
);
export type LowercaseString = typeof LowercaseString.Type;

export const HexString = Schema.TemplateLiteral([
  Schema.Literal("0x"),
  Schema.String,
]);
export type HexString = typeof HexString.Type;
