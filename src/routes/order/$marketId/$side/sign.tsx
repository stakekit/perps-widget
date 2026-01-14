import { createFileRoute } from "@tanstack/react-router";
import { OrderSignRoute } from "@/components/modules/Order/sign";

export const Route = createFileRoute("/order/$marketId/$side/sign")({
  component: OrderSignRoute,
});
