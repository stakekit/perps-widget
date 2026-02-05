import { createFileRoute } from "@tanstack/react-router";
import { AccountBalances } from "../../components/modules/Account/balance";

export const Route = createFileRoute("/account/")({
  component: AccountBalances,
});
