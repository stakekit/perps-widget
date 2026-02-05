import { createFileRoute } from "@tanstack/react-router";
import { CloseSignRoute } from "../../../../components/modules/PositionDetails/Close/sign";

export const Route = createFileRoute("/position-details/$marketId/close_/sign")(
  {
    component: CloseSignRoute,
  },
);
