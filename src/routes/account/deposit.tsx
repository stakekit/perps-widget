import { createFileRoute } from "@tanstack/react-router";
import { AccountDeposit } from "@/components/modules/Account/deposit";

export const Route = createFileRoute("/account/deposit")({
  component: AccountDeposit,
});
