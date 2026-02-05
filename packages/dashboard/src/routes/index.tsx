import { createFileRoute } from "@tanstack/react-router";
import { TradePage } from "../components/modules/trade";

export const Route = createFileRoute("/")({
  component: TradePage,
});
