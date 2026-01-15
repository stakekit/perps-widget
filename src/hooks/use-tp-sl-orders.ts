import { Match, Option, Schema } from "effect";
import type { OrderDto } from "@/services/api-client/api-schemas";

const TpSlOrderSchema = Schema.Struct({
  type: Schema.Literal("take_profit", "stop_loss"),
  limitPrice: Schema.optional(Schema.Number),
  triggerPrice: Schema.optional(Schema.Number),
});

export const useTpSlOrders = (orders: OrderDto[]) => {
  return orders.reduce(
    (acc, order) => {
      const decoded = Schema.decodeUnknownOption(TpSlOrderSchema)(order).pipe(
        Option.getOrNull,
      );

      if (!decoded) return acc;

      Match.value(decoded).pipe(
        Match.when({ type: "take_profit" }, (v) => {
          acc.takeProfit = v;
        }),
        Match.when({ type: "stop_loss" }, (v) => {
          acc.stopLoss = v;
        }),
      );

      return acc;
    },
    {
      takeProfit: null,
      stopLoss: null,
    } as {
      takeProfit: typeof TpSlOrderSchema.Type | null;
      stopLoss: typeof TpSlOrderSchema.Type | null;
    },
  );
};
