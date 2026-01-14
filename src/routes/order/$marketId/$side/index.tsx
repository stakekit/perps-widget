import { createFileRoute, getRouteApi, Navigate } from "@tanstack/react-router";
import { MarketOrder } from "@/components/modules/Order/Overview";

export const Route = createFileRoute("/order/$marketId/$side/")({
  component: RouteComponent,
});

const routerApi = getRouteApi("/order/$marketId/$side/");

function RouteComponent() {
  const { side } = routerApi.useParams();

  if (side !== "long" && side !== "short") {
    return <Navigate to="/" />;
  }

  return <MarketOrder side={side} />;
}
