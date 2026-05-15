import { Schema } from "effect";
import * as ApiSchemas from "../services/api-client/api-schemas";
import { TokenAddress } from "./ids";

export class TokenIdentifier extends Schema.Class<TokenIdentifier>(
  "TokenIdentifier",
)({
  ...ApiSchemas.TokenIdentifierDto.fields,
  address: Schema.optionalKey(TokenAddress),
}) {}

export class TokenInfo extends Schema.Class<TokenInfo>("TokenInfo")({
  ...ApiSchemas.MarketDto.fields.baseAsset.fields,
  address: Schema.optionalKey(TokenAddress),
}) {}

export type Token = TokenInfo;
