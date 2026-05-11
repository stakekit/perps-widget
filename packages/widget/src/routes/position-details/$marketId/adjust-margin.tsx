import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import { AdjustMarginRoute } from "../../../components/modules/PositionDetails/AdjustMargin";

export const Route = createFileRoute(
  "/position-details/$marketId/adjust-margin",
)({
  component: AdjustMarginRoute,
  validateSearch: Schema.toStandardSchemaV1(
    Schema.Struct({
      mode: Schema.optional(Schema.Literals(["add", "remove"])),
    }),
  ),
});
