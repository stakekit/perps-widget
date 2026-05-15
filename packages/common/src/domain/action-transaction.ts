import { Schema } from "effect";
import * as ApiSchemas from "../services/api-client/api-schemas";
import { ChainId, TransactionId } from "./ids";
import { PendingAction } from "./pending-action";

export class ActionTransaction extends Schema.Class<ActionTransaction>(
  "ActionTransaction",
)({
  ...ApiSchemas.TransactionDto.fields,
  id: TransactionId,
  chainId: ChainId,
  address: Schema.String,
  args: Schema.optionalKey(PendingAction.fields.args),
}) {}
