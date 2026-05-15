import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import PositionDetails from "../../../components/modules/PositionDetails/Overview";

export const Route = createFileRoute("/position-details/$marketId/")({
  component: PositionDetails,
  validateSearch: Schema.toStandardSchemaV1(
    Schema.Struct({
      tab: Schema.optional(Schema.Literals(["overview", "position", "orders"])),
    }),
  ),
});
