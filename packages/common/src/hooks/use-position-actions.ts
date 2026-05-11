import { Match, Option, Schema } from "effect";
import type { PositionDto } from "../services/api-client/api-schemas";

const UpdateLeverageSchema = Schema.Struct({
  type: Schema.Literal("updateLeverage"),
  args: Schema.Struct({
    marketId: Schema.String,
  }),
});

const SetTpAndSlSchema = Schema.Struct({
  type: Schema.Literal("setTpAndSl"),
  args: Schema.Struct({
    marketId: Schema.String,
    stopLossOrderId: Schema.optional(Schema.String),
    takeProfitOrderId: Schema.optional(Schema.String),
  }),
});

const PendingActionSchema = Schema.Union([
  UpdateLeverageSchema,
  SetTpAndSlSchema,
]);

export const getPositionActions = (
  pendingActions: PositionDto["pendingActions"],
) => {
  return pendingActions.reduce(
    (acc, pa) => {
      const decoded = Schema.decodeUnknownOption(PendingActionSchema)(pa).pipe(
        Option.getOrNull,
      );

      if (!decoded) return acc;

      Match.value(decoded).pipe(
        Match.when({ type: "updateLeverage" }, (v) => {
          acc.updateLeverage = v;
        }),
        Match.when({ type: "setTpAndSl" }, (v) => {
          acc.setTpAndSl = v;
        }),
      );

      return acc;
    },
    {
      updateLeverage: null,
      setTpAndSl: null,
    } as {
      updateLeverage: typeof UpdateLeverageSchema.Type | null;
      setTpAndSl: typeof SetTpAndSlSchema.Type | null;
    },
  );
};

export const usePositionActions = (position: PositionDto) => {
  return getPositionActions(position.pendingActions);
};
