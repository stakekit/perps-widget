import { Option, Schema } from "effect";
import type { OrderDto } from "../services/api-client/api-schemas";

const CancelOrderPendingActionSchema = Schema.Struct({
  type: Schema.Literal("cancelOrder"),
  args: Schema.Struct({
    marketId: Schema.String,
    orderId: Schema.String,
  }),
});

export const useOrderActions = (order: OrderDto) => {
  return order.pendingActions.reduce(
    (acc, pa) => {
      const decoded = Schema.decodeUnknownOption(
        CancelOrderPendingActionSchema,
      )(pa).pipe(Option.getOrNull);

      if (!decoded) return acc;

      acc.cancelOrderAction = decoded;

      return acc;
    },
    {
      cancelOrderAction: null,
    } as {
      cancelOrderAction: typeof CancelOrderPendingActionSchema.Type | null;
    },
  );
};
