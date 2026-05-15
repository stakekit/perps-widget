import { Schema } from "effect";
import * as ApiSchemas from "../services/api-client/api-schemas";
import { ActionTransaction } from "./action-transaction";
import { ActionId, ProviderId } from "./ids";
import { NumberFromString } from "./scalars";
import { TokenIdentifier } from "./token";

class ActionSummary extends Schema.Class<ActionSummary>("ActionSummary")({
  ...ApiSchemas.ActionDto.fields.summary.members[0].fields,
  size: Schema.optionalKey(NumberFromString),
  amount: Schema.optionalKey(NumberFromString),
  pnl: Schema.optionalKey(NumberFromString),
  margin: Schema.optionalKey(NumberFromString),
  fee: Schema.optionalKey(NumberFromString),
  collateral: Schema.optionalKey(NumberFromString),
  fromToken: Schema.optionalKey(TokenIdentifier),
}) {}

export class Action extends Schema.Class<Action>("Action")({
  ...ApiSchemas.ActionDto.fields,
  id: ActionId,
  providerId: ProviderId,
  summary: Schema.NullOr(ActionSummary),
  transactions: Schema.Array(ActionTransaction),
}) {}
