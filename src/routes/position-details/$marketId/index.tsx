import { createFileRoute } from "@tanstack/react-router";
import PositionDetails from "@/components/modules/PositionDetails/Overview";

export const Route = createFileRoute("/position-details/$marketId/")({
  component: PositionDetails,
});
