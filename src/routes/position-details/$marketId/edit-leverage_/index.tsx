import { createFileRoute } from "@tanstack/react-router";
import { EditLeverageSignRoute } from "@/components/modules/PositionDetails/Overview/EditLeverage/sign";

export const Route = createFileRoute(
  "/position-details/$marketId/edit-leverage_/",
)({
  component: EditLeverageSignRoute,
});
