import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { FormBuilder, FormReact } from "@lucas-barake/effect-form-react";
import {
  actionAtom,
  providersAtom,
  selectedProviderBalancesAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import { AmountField } from "@yieldxyz/perps-common/components";
import {
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import {
  clampPercent,
  percentOf,
  round,
  valueFromPercent,
} from "@yieldxyz/perps-common/lib";
import {
  ApiClientService,
  type ApiTypes,
  runtimeAtom,
} from "@yieldxyz/perps-common/services";
import { Array as _Array, Effect, Option, Schema } from "effect";

const selectedProviderAtom = Atom.writable(
  (ctx) =>
    ctx
      .get(providersAtom)
      .pipe(Result.map(_Array.head), Result.map(Option.getOrNull)),
  (ctx, value: ApiTypes.ProviderDto) => ctx.setSelf(Result.success(value)),
);

export const useProviders = () => {
  const providers = useAtomValue(providersAtom).pipe(
    Result.getOrElse(() => null),
  );

  return {
    providers,
  };
};

export const useSelectedProvider = () => {
  const selectedProvider = useAtomValue(selectedProviderAtom).pipe(
    Result.getOrElse(() => null),
  );
  const setSelectedProvider = useAtomSet(selectedProviderAtom);

  return {
    selectedProvider,
    setSelectedProvider,
  };
};

export const useProviderBalance = (wallet: WalletConnected) => {
  const providerBalance = useAtomValue(
    selectedProviderBalancesAtom(wallet.currentAccount.address),
  ).pipe(Result.getOrElse(() => null));

  return {
    providerBalance,
  };
};

export const useWithdrawForm = () => {
  const submit = useAtomSet(WithdrawForm.submit);
  const submitResult = useAtomValue(WithdrawForm.submit);

  return {
    submit,
    submitResult,
  };
};

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

export const WithdrawForm = FormReact.make(withdrawFormBuilder, {
  runtime: runtimeAtom,
  fields: { Amount: AmountField },
  onSubmit: ({ wallet }: { wallet: WalletConnected }, { decoded }) =>
    Effect.gen(function* () {
      const client = yield* ApiClientService;
      const registry = yield* Registry.AtomRegistry;

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

      const action = yield* client.ActionsControllerExecuteAction({
        providerId: selectedProvider.id,
        address: wallet.currentAccount.address,
        action: "withdraw",
        args: {
          amount: decoded.Amount.toString(),
        },
      });

      registry.set(actionAtom, action);
    }),
});

const setAmountFieldAtom = WithdrawForm.setValue(WithdrawForm.fields.Amount);
const amountFieldAtom = WithdrawForm.getFieldValue(WithdrawForm.fields.Amount);

export const useSetWithdrawAmount = () => {
  const setAmount = useAtomSet(setAmountFieldAtom);

  return {
    setAmount,
  };
};

export const useWithdrawPercentage = (wallet: WalletConnected) => {
  const amount = useAtomValue(amountFieldAtom).pipe(
    Option.map(Number),
    Option.filter((v) => !Number.isNaN(v)),
    Option.getOrElse(() => 0),
  );

  const setAmount = useAtomSet(setAmountFieldAtom);

  const availableBalance = useAtomValue(
    selectedProviderBalancesAtom(wallet.currentAccount.address),
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
