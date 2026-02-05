import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import PositionDetails from "../../../components/modules/PositionDetails/Overview";

export const Route = createFileRoute("/position-details/$marketId/")({
  component: PositionDetails,
  validateSearch: Schema.standardSchemaV1(
    Schema.Struct({
      tab: Schema.optional(Schema.Literal("overview", "position", "orders")),
    }),
  ),
});
