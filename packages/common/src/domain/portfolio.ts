import { Schema } from "effect";
import * as ApiSchemas from "../services/api-client/api-schemas";
import { MarketId, ProviderId } from "./ids";
import { PendingAction } from "./pending-action";
import { NumberFromString } from "./scalars";
import { TokenInfo } from "./token";

export class Balance extends Schema.Class<Balance>("Balance")({
  ...ApiSchemas.BalanceDto.fields,
  providerId: ProviderId,
  collateral: TokenInfo,
}) {}

export class Position extends Schema.Class<Position>("Position")({
  ...ApiSchemas.PositionDto.fields,
  marketId: MarketId,
  size: NumberFromString,
  pendingActions: Schema.Array(PendingAction),
}) {}

export class Order extends Schema.Class<Order>("Order")({
  ...ApiSchemas.OrderDto.fields,
  marketId: MarketId,
  size: NumberFromString,
  pendingActions: Schema.Array(PendingAction),
}) {}
