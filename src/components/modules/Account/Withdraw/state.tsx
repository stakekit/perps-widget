import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { FormBuilder, FormReact } from "@lucas-barake/effect-form-react";
import { Array as _Array, Effect, Option, Schema } from "effect";
import { actionAtom } from "@/atoms/actions-atoms";
import { selectedProviderBalancesAtom } from "@/atoms/portfolio-atoms";
import { providersAtom } from "@/atoms/providers-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { AmountField } from "@/components/molecules/forms";
import type { WalletConnected } from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import type { ProviderDto } from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";

const selectedProviderAtom = Atom.writable(
  (ctx) =>
    ctx
      .get(providersAtom)
      .pipe(Result.map(_Array.head), Result.map(Option.getOrNull)),
  (ctx, value: ProviderDto) => ctx.setSelf(Result.success(value)),
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
    selectedProviderBalancesAtom(wallet),
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

      if (!wallet || wallet.status !== "connected") {
        return yield* Effect.dieMessage("No wallet");
      }

      const providerBalance = registry
        .get(selectedProviderBalancesAtom(wallet))
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
        .get(selectedProviderBalancesAtom(wallet))
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
const amountFieldAtom = WithdrawForm.getFieldAtom(WithdrawForm.fields.Amount);

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

  const providerBalance = useAtomValue(
    selectedProviderBalancesAtom(wallet),
  ).pipe(Result.getOrElse(() => null));

  if (!providerBalance) {
    return {
      percentage: 0,
    };
  }

  const percentage = Math.min(
    100,
    Math.max(0, (amount / providerBalance.availableBalance) * 100),
  );

  return {
    percentage: Math.round(percentage),
  };
};
