import { createFileRoute } from "@tanstack/react-router";
import { AdjustMarginSignRoute } from "../../../../components/modules/PositionDetails/AdjustMargin/sign";

export const Route = createFileRoute(
  "/position-details/$marketId/adjust-margin_/sign",
)({
  component: AdjustMarginSignRoute,
});
