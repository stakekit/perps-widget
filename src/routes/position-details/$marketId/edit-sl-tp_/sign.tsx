import { createFileRoute } from "@tanstack/react-router";
import { EditSLTPSignRoute } from "@/components/modules/PositionDetails/Overview/Position/sign";

export const Route = createFileRoute(
  "/position-details/$marketId/edit-sl-tp_/sign",
)({
  component: EditSLTPSignRoute,
});
