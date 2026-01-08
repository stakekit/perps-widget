import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/modules/Home";

export const Route = createFileRoute("/")({
  component: Home,
});
