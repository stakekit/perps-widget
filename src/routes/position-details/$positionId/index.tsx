import { createFileRoute } from "@tanstack/react-router";
import PositionDetails from "@/components/modules/PositionDetails";

export const Route = createFileRoute("/position-details/$positionId/")({
  component: PositionDetails,
});
