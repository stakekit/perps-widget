import { createFileRoute } from "@tanstack/react-router";
import { MarketOrder } from "@/components/modules/PositionDetails/Order";

export const Route = createFileRoute("/position-details/$positionId/order")({
  component: MarketOrder,
});
