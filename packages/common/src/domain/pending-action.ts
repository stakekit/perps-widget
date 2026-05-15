import { Schema } from "effect";
import * as ApiSchemas from "../services/api-client/api-schemas";
import { MarketId } from "./ids";
import { NumberFromString } from "./scalars";
import { TokenIdentifier } from "./token";

class PendingActionArgs extends Schema.Class<PendingActionArgs>(
  "PendingActionArgs",
)({
  ...ApiSchemas.PendingActionDto.fields.args.fields,
  marketId: Schema.optionalKey(MarketId),
  amount: Schema.optionalKey(NumberFromString),
  size: Schema.optionalKey(NumberFromString),
  fromToken: Schema.optionalKey(TokenIdentifier),
}) {}

export class PendingAction extends Schema.Class<PendingAction>("PendingAction")(
  {
    ...ApiSchemas.PendingActionDto.fields,
    args: PendingActionArgs,
  },
) {}
