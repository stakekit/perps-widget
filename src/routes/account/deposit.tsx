import { createFileRoute } from "@tanstack/react-router";
import { AccountDeposit } from "@/components/modules/Account/Deposit";

export const Route = createFileRoute("/account/deposit")({
  component: AccountDeposit,
});
