import { createFileRoute } from "@tanstack/react-router";
import { AccountWithdraw } from "@/components/modules/Account/withdraw";

export const Route = createFileRoute("/account/withdraw")({
  component: AccountWithdraw,
});
