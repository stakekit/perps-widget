import { createFileRoute } from "@tanstack/react-router";
import { CancelOrderSignRoute } from "../../../../components/modules/PositionDetails/Overview/CancelOrder/sign";

export const Route = createFileRoute(
  "/position-details/$marketId/cancel-order_/sign",
)({
  component: CancelOrderSignRoute,
});
