import { Equal, Schema, SchemaTransformation } from "effect";
import { TokenIdentifierDto } from "../services/api-client/api-schemas";

const LowercaseString = Schema.String.pipe(
  Schema.decodeTo(
    Schema.String.check(Schema.isLowercased()),
    SchemaTransformation.transform({
      decode: (input) => input.toLowerCase(),
      encode: (input) => input,
    }),
  ),
);

const Token = Schema.Struct({
  network: TokenIdentifierDto.fields.network,
  address: Schema.optional(LowercaseString),
}).pipe(Schema.brand("Token"));

export const makeToken = Schema.decodeSync(Token);

export const arbUsdcToken = makeToken({
  network: "arbitrum",
  address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
});

export const ethNativeToken = makeToken({
  network: "ethereum",
  address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
});

export const tokenIsSame = Equal.asEquivalence<typeof Token.Type>();

export const isArbUsdcToken = (otherToken: typeof Token.Type) =>
  tokenIsSame(otherToken, arbUsdcToken);

export const isEthNativeToken = (otherToken: typeof Token.Type) =>
  tokenIsSame(otherToken, ethNativeToken);
