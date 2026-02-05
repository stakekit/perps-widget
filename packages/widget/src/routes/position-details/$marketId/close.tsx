import { createFileRoute } from "@tanstack/react-router";
import { ClosePositionRoute } from "../../../components/modules/PositionDetails/Close";

export const Route = createFileRoute("/position-details/$marketId/close")({
  component: ClosePositionRoute,
});
