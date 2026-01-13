import { createFileRoute } from "@tanstack/react-router";
import { WithdrawSignRoute } from "@/components/modules/Account/Withdraw/sign";

export const Route = createFileRoute("/account/withdraw_/sign")({
  component: WithdrawSignRoute,
});
