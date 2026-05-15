import { Schema } from "effect";
import * as ApiSchemas from "../services/api-client/api-schemas";
import { Action } from "./action";
import {
  ActionId,
  EventId,
  MarketId,
  ProviderId,
  ProviderOrderId,
} from "./ids";
import { NumberFromString } from "./scalars";

class ApiEventOrder extends Schema.Class<ApiEventOrder>("ApiEventOrder")({
  ...ApiSchemas.EventDto.fields.order.fields,
  orderId: ProviderOrderId,
  marketId: MarketId,
  originalSizeBase: NumberFromString,
  remainingSizeBase: NumberFromString,
  closedPnl: Schema.optionalKey(NumberFromString),
}) {}

export class ApiEvent extends Schema.Class<ApiEvent>("ApiEvent")({
  ...ApiSchemas.EventDto.fields,
  id: EventId,
  providerId: ProviderId,
  marketId: Schema.optionalKey(Schema.NullOr(MarketId)),
  perpActionId: Schema.optionalKey(ActionId),
  providerOrderId: Schema.optionalKey(Schema.NullOr(ProviderOrderId)),
  order: ApiEventOrder,
}) {}

export class ActivityActionItem extends Schema.Class<ActivityActionItem>(
  "ActivityActionItem",
)({
  type: Schema.Literal("action"),
  action: Action,
}) {}

export class ActivityEventItem extends Schema.Class<ActivityEventItem>(
  "ActivityEventItem",
)({
  type: Schema.Literal("event"),
  event: ApiEvent,
}) {}

export const ActivityItem = Schema.Union([
  ActivityActionItem,
  ActivityEventItem,
]);
export type ActivityItem = typeof ActivityItem.Type;
