import { Match, Option, Schema } from "effect";
import type { PositionDto } from "@/services/api-client/api-schemas";

const UpdateLeverageSchema = Schema.Struct({
  type: Schema.Literal("updateLeverage"),
  args: Schema.Struct({
    marketId: Schema.String,
    leverage: Schema.Number,
  }),
});

const TpSlSchema = Schema.Struct({
  type: Schema.Literal("stopLoss", "takeProfit"),
  args: Schema.Struct({
    marketId: Schema.String,
    orderId: Schema.optional(Schema.String),
  }),
});

const PendingActionSchema = Schema.Union(UpdateLeverageSchema, TpSlSchema);

export const usePositionActions = (position: PositionDto) => {
  return position.pendingActions.reduce(
    (acc, pa) => {
      const decoded = Schema.decodeUnknownOption(PendingActionSchema)(pa).pipe(
        Option.getOrNull,
      );

      if (!decoded) return acc;

      Match.value(decoded).pipe(
        Match.when({ type: "updateLeverage" }, (v) => {
          acc.updateLeverage = v;
        }),
        Match.when({ type: "stopLoss" }, (v) => {
          acc.stopLoss = v;
        }),
        Match.when({ type: "takeProfit" }, (v) => {
          acc.takeProfit = v;
        }),
      );

      return acc;
    },
    {
      updateLeverage: null,
      stopLoss: null,
      takeProfit: null,
    } as {
      updateLeverage: typeof UpdateLeverageSchema.Type | null;
      stopLoss: typeof TpSlSchema.Type | null;
      takeProfit: typeof TpSlSchema.Type | null;
    },
  );
};
