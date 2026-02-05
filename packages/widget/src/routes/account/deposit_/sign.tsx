import { createFileRoute } from "@tanstack/react-router";
import { DepositSignRoute } from "../../../components/modules/Account/Deposit/sign";

export const Route = createFileRoute("/account/deposit_/sign")({
  component: DepositSignRoute,
});
