import { createFileRoute } from "@tanstack/react-router";
import { AccountWithdraw } from "../../components/modules/Account/Withdraw";

export const Route = createFileRoute("/account/withdraw")({
  component: AccountWithdraw,
});
