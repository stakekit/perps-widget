import { Equal, Schema } from "effect";
import { Networks } from "../services/api-client/api-schemas";

const Token = Schema.Struct({
  network: Networks,
  address: Schema.optional(Schema.Lowercase),
}).pipe(Schema.Data, Schema.brand("Token"));

export const makeToken = Schema.decodeSync(Token);

export const arbUsdcToken = makeToken({
  network: "arbitrum",
  address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
});

export const ethNativeToken = makeToken({
  network: "ethereum",
  address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
});

export const tokenIsSame = Equal.equivalence<typeof Token.Type>();

export const isArbUsdcToken = (otherToken: typeof Token.Type) =>
  tokenIsSame(otherToken, arbUsdcToken);

export const isEthNativeToken = (otherToken: typeof Token.Type) =>
  tokenIsSame(otherToken, ethNativeToken);
