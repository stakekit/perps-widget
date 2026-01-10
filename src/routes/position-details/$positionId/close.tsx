import { createFileRoute } from "@tanstack/react-router";
import ClosePosition from "@/components/modules/PositionDetails/close-position";

export const Route = createFileRoute("/position-details/$positionId/close")({
  component: ClosePosition,
});
