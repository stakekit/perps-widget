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
  selectedProviderAtom,
  selectedProviderBalancesAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import { Text } from "@yieldxyz/perps-common/components";
import {
  isWalletConnected,
  type WalletAccount,
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

const withdrawSelectedProviderAtom = Atom.writable(
  (ctx) =>
    ctx
      .get(providersAtom)
      .pipe(Result.map(_Array.head), Result.map(Option.getOrNull)),
  (ctx, value: ApiTypes.ProviderDto) => ctx.setSelf(Result.success(value)),
);

export const useProviders = (): {
  selectedProvider: ApiTypes.ProviderDto | null;
  setSelectedProvider: (value: ApiTypes.ProviderDto) => void;
} => {
  const selectedProvider = useAtomValue(selectedProviderAtom).pipe(
    Result.getOrElse(() => null),
  );
  const setSelectedProvider = useAtomSet(withdrawSelectedProviderAtom);

  return {
    selectedProvider,
    setSelectedProvider,
  };
};

export const useProviderBalance = (walletAddress: WalletAccount["address"]) => {
  const providerBalance = useAtomValue(
    selectedProviderBalancesAtom(walletAddress),
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

// Custom amount field component that matches the deposit dialog design
const WithdrawAmountField: FormReact.FieldComponent<string> = ({ field }) => {
  const onChange: (typeof field)["onChange"] = (newValue) => {
    const value = newValue.replace(/[^0-9.,]/g, "");
    const parts = value.split(/[.,]/);
    if (parts.length > 2) return;
    field.onChange(value);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="bg-white/5 rounded-[10px] h-9 flex items-center px-[10px]">
        <input
          inputMode="decimal"
          value={field.value}
          onFocus={() => {
            if (field.value === "0") {
              onChange("");
            }
          }}
          onBlurCapture={() => {
            if (field.value === "" || field.value.startsWith("00")) {
              onChange("0");
            }
          }}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          pattern="^(?!0\d)\d*([.,])?(\d+)?$"
          minLength={1}
          maxLength={79}
          onBlur={field.onBlur}
          placeholder="0.00"
          className="h-10 text-white text-sm font-semibold tracking-[-0.42px] leading-tight bg-transparent border-none outline-none placeholder:text-gray-4 w-full caret-accent-green"
        />
      </div>
      {Option.isSome(field.error) && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-red/10 border border-accent-red/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="size-4 rounded-full bg-accent-red/20 flex items-center justify-center">
            <Text
              as="span"
              variant="inherit"
              className="text-accent-red text-xs font-bold"
            >
              !
            </Text>
          </div>
          <Text
            as="span"
            variant="inherit"
            className="text-accent-red text-sm font-medium"
          >
            {field.error.value}
          </Text>
        </div>
      )}
    </div>
  );
};

export const WithdrawForm = FormReact.make(withdrawFormBuilder, {
  runtime: runtimeAtom,
  fields: { Amount: WithdrawAmountField },
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
