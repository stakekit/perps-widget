import {
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { FormBuilder, FormReact } from "@lucas-barake/effect-form-react";
import { Effect, Option, Schema } from "effect";
import {
  actionAtom,
  selectedProviderAtom,
  selectedProviderBalancesAtom,
  walletAtom,
} from "../atoms";
import { AmountField } from "../components";
import { isWalletConnected, type WalletAccount } from "../domain";
import { clampPercent, percentOf, round, valueFromPercent } from "../lib";
import { ApiClientService, runtimeAtom } from "../services";

export const withdrawFormBuilder = FormBuilder.empty
  .addField(
    "Amount",
    Schema.NumberFromString.pipe(
      Schema.annotations({ message: () => "Invalid amount" }),
      Schema.greaterThan(0, { message: () => "Must be greater than 0" }),
    ),
  )
  .refineEffect((values) =>
    Effect.gen(function* () {
      const registry = yield* Registry.AtomRegistry;
      const wallet = registry
        .get(walletAtom)
        .pipe(Result.getOrElse(() => null));

      if (!isWalletConnected(wallet)) {
        return yield* Effect.dieMessage("No wallet");
      }

      const providerBalance = registry
        .get(selectedProviderBalancesAtom(wallet.currentAccount.address))
        .pipe(Result.getOrElse(() => null));

      if (!providerBalance) {
        return { path: ["Amount"], message: "Missing provider balance" };
      }

      if (providerBalance.availableBalance <= 0) {
        return {
          path: ["Amount"],
          message: "No available balance to withdraw",
        };
      }

      if (values.Amount > providerBalance.availableBalance) {
        return {
          path: ["Amount"],
          message: "Insufficient balance",
        };
      }
    }),
  );

export type WithdrawFormBuilder = typeof withdrawFormBuilder;

const withdrawOnSubmit = Effect.gen(function* () {
  const client = yield* ApiClientService;
  const registry = yield* Registry.AtomRegistry;

  const wallet = registry.get(walletAtom).pipe(Result.getOrElse(() => null));

  if (!isWalletConnected(wallet)) {
    return yield* Effect.dieMessage("No wallet");
  }

  const selectedProvider = registry
    .get(selectedProviderAtom)
    .pipe(Result.getOrElse(() => null));

  if (!selectedProvider) {
    return yield* Effect.dieMessage("No selected provider");
  }

  const providerBalance = registry
    .get(selectedProviderBalancesAtom(wallet.currentAccount.address))
    .pipe(Result.getOrElse(() => null));

  if (!providerBalance) {
    return yield* Effect.dieMessage("No provider balance");
  }

  return { client, wallet, selectedProvider, providerBalance };
});

export const createWithdrawForm = (
  amountFieldComponent: FormReact.FieldComponent<string>,
) =>
  FormReact.make(withdrawFormBuilder, {
    runtime: runtimeAtom,
    fields: { Amount: amountFieldComponent },
    onSubmit: (_, { decoded }) =>
      Effect.gen(function* () {
        const { client, wallet, selectedProvider } = yield* withdrawOnSubmit;

        const action = yield* client.ActionsControllerExecuteAction({
          providerId: selectedProvider.id,
          address: wallet.currentAccount.address,
          action: "withdraw",
          args: {
            amount: decoded.Amount.toString(),
          },
        });

        const registry = yield* Registry.AtomRegistry;
        registry.set(actionAtom, action);
      }),
  });

export const WithdrawForm = createWithdrawForm(AmountField);

const setAmountFieldAtom = WithdrawForm.setValue(WithdrawForm.fields.Amount);
const amountFieldAtom = WithdrawForm.getFieldValue(WithdrawForm.fields.Amount);

export const useWithdrawForm = () => {
  const submit = useAtomSet(WithdrawForm.submit);
  const submitResult = useAtomValue(WithdrawForm.submit);

  return {
    submit,
    submitResult,
  };
};

export const useSetWithdrawAmount = () => {
  const setAmount = useAtomSet(setAmountFieldAtom);

  return {
    setAmount,
  };
};

export const useWithdrawPercentage = (
  walletAddress: WalletAccount["address"],
) => {
  const amount = useAtomValue(amountFieldAtom).pipe(
    Option.map(Number),
    Option.filter((v) => !Number.isNaN(v)),
    Option.getOrElse(() => 0),
  );

  const setAmount = useAtomSet(setAmountFieldAtom);

  const availableBalance = useAtomValue(
    selectedProviderBalancesAtom(walletAddress),
  ).pipe(
    Result.value,
    Option.map((v) => v.availableBalance),
    Option.getOrElse(() => 0),
  );

  const handlePercentageChange = (newPercentage: number) => {
    if (newPercentage >= 100) {
      return setAmount(availableBalance.toString());
    }

    const amount = valueFromPercent({
      total: availableBalance,
      percent: newPercentage,
    });
    setAmount(round(amount, 6).toString());
  };

  const percentage = clampPercent(
    percentOf({ part: amount, whole: availableBalance }),
  );

  return {
    percentage: Math.round(percentage),
    handlePercentageChange,
  };
};
