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
  positionsAtom,
  selectedProviderAtom,
  selectedProviderBalancesAtom,
  type UpdateMarginMode,
} from "@yieldxyz/perps-common/atoms";
import { AmountField, ToggleGroup } from "@yieldxyz/perps-common/components";
import {
  type WalletAccount,
  WalletAccountAddress,
} from "@yieldxyz/perps-common/domain";
import {
  clampPercent,
  getEstimatedLiquidationPriceForProjectedMargin,
  getSignedUpdateMarginAmount,
  percentOf,
  round,
  valueFromPercent,
} from "@yieldxyz/perps-common/lib";
import {
  ApiClientService,
  type ApiTypes,
  runtimeAtom,
} from "@yieldxyz/perps-common/services";
import { Effect, Option, Record, Schema } from "effect";

export const AdjustMarginFormKey = Schema.Struct({
  walletAddress: WalletAccountAddress,
  marketId: Schema.String,
  mode: Schema.Literal("add", "remove"),
}).pipe(Schema.Data, Schema.brand("AdjustMarginFormKey"));

export type AdjustMarginFormKey = typeof AdjustMarginFormKey.Type;

export const makeAdjustMarginFormKey = Schema.decodeSync(AdjustMarginFormKey);

const adjustMarginPositionAtom = Atom.family(
  (args: typeof AdjustMarginFormKey.Type) =>
    runtimeAtom.atom(
      Effect.fn(function* (ctx) {
        const positions = yield* ctx.result(positionsAtom(args.walletAddress));

        const positionRef = Record.get(positions, args.marketId);

        if (positionRef._tag === "None") {
          return yield* Effect.dieMessage("Position not found");
        }

        return positionRef.value.value;
      }),
    ),
);

const adjustMarginFormAtom = Atom.family(
  (key: typeof AdjustMarginFormKey.Type) => {
    const adjustMarginFormBuilder = FormBuilder.empty
      .addField(
        "Amount",
        Schema.NumberFromString.pipe(
          Schema.annotations({ message: () => "Invalid amount" }),
          Schema.greaterThan(0, { message: () => "Must be greater than 0" }),
        ),
      )
      .addField(
        "Mode",
        Schema.Literal("add", "remove").pipe(
          Schema.annotations({ message: () => "Invalid mode" }),
        ),
      )
      .refineEffect((values) =>
        Effect.gen(function* () {
          const registry = yield* Registry.AtomRegistry;

          const providerBalance = registry
            .get(selectedProviderBalancesAtom(key.walletAddress))
            .pipe(Result.getOrElse(() => null));

          const position = registry
            .get(adjustMarginPositionAtom(key))
            .pipe(Result.getOrElse(() => null));

          if (!providerBalance) {
            return { path: ["Amount"], message: "Missing provider balance" };
          }

          if (!position) {
            return { path: ["Amount"], message: "Missing position" };
          }

          if (position.marginMode !== "isolated") {
            return {
              path: ["Amount"],
              message: "Only isolated positions can adjust margin",
            };
          }

          const maxAmount =
            values.Mode === "add"
              ? providerBalance.availableBalance
              : position.margin;

          if (maxAmount <= 0) {
            return {
              path: ["Amount"],
              message:
                values.Mode === "add"
                  ? "No available balance"
                  : "No margin to remove",
            };
          }

          if (values.Amount > maxAmount) {
            return {
              path: ["Amount"],
              message:
                values.Mode === "add"
                  ? "Insufficient balance"
                  : "Amount exceeds position margin",
            };
          }
        }),
      );

    return FormReact.make(adjustMarginFormBuilder, {
      runtime: runtimeAtom,
      fields: {
        Amount: AmountField,
        Mode: ({ field }) => (
          <ToggleGroup
            options={[
              { value: "add", label: "Add" },
              { value: "remove", label: "Remove" },
            ]}
            value={field.value}
            onValueChange={field.onChange}
          />
        ),
      },
      onSubmit: (_, { decoded }) =>
        Effect.gen(function* () {
          const registry = yield* Registry.AtomRegistry;

          const position = registry
            .get(adjustMarginPositionAtom(key))
            .pipe(Result.getOrElse(() => null));

          if (!position) {
            return yield* Effect.dieMessage("Position not found");
          }

          const client = yield* ApiClientService;

          const selectedProvider = registry
            .get(selectedProviderAtom)
            .pipe(Result.getOrElse(() => null));

          if (!selectedProvider) {
            return yield* Effect.dieMessage("No selected provider");
          }

          const signedAmount = getSignedUpdateMarginAmount({
            amount: decoded.Amount,
            mode: decoded.Mode,
          });

          if (!signedAmount) {
            return yield* Effect.dieMessage("Invalid margin amount");
          }

          const action = yield* client.ActionsControllerExecuteAction({
            providerId: selectedProvider.id,
            address: key.walletAddress,
            action: "updateMargin",
            args: {
              marketId: position.marketId,
              amount: signedAmount,
            },
          });

          registry.set(actionAtom, action);
        }),
    });
  },
);

export const getAdjustMarginCalculations = ({
  position,
  availableBalance,
  amount,
  mode,
}: {
  position: ApiTypes.PositionDto;
  availableBalance: number;
  amount: number;
  mode: UpdateMarginMode;
}) => {
  const signedMarginDelta = mode === "add" ? amount : -amount;
  const projectedMargin = position.margin + signedMarginDelta;
  const maxAmount = mode === "add" ? availableBalance : position.margin;

  return {
    maxAmount,
    projectedMargin,
    currentMargin: position.margin,
    currentLiquidationPrice: position.liquidationPrice,
    estimatedLiquidationPrice: getEstimatedLiquidationPriceForProjectedMargin({
      position,
      projectedMargin,
    }),
  };
};

export const useAdjustMarginPosition = (
  key: typeof AdjustMarginFormKey.Type,
) => {
  return useAtomValue(adjustMarginPositionAtom(key));
};

export const useAdjustMargin = ({
  key,
  position,
  availableBalance,
  mode,
}: {
  key: typeof AdjustMarginFormKey.Type;
  position: ApiTypes.PositionDto;
  availableBalance: number;
  mode: UpdateMarginMode;
}) => {
  const AdjustMarginForm = adjustMarginFormAtom(key);

  const amountFieldAtom = AdjustMarginForm.getFieldAtoms(
    AdjustMarginForm.fields.Amount,
  );

  const setAmount = useAtomSet(amountFieldAtom.setValue);

  const amount = useAtomValue(amountFieldAtom.value).pipe(
    Option.map(Number),
    Option.filter((value) => !Number.isNaN(value)),
    Option.getOrElse(() => 0),
  );

  const maxAmount = mode === "add" ? availableBalance : position.margin;

  const handlePercentageChange = (newPercentage: number) => {
    if (newPercentage >= 100) {
      return setAmount(round(maxAmount, 6).toString());
    }

    const nextAmount = valueFromPercent({
      total: maxAmount,
      percent: newPercentage,
    });

    setAmount(round(nextAmount, 6).toString());
  };

  const percentage = clampPercent(
    round(percentOf({ part: amount, whole: maxAmount }), 2),
  );

  const submit = useAtomSet(AdjustMarginForm.submit);
  const submitResult = useAtomValue(AdjustMarginForm.submit);

  return {
    AdjustMarginForm,
    amount,
    mode,
    submit,
    submitResult,
    handlePercentageChange,
    percentage,
  };
};

export const useSelectedProviderBalanceResult = (
  walletAddress: WalletAccount["address"],
) => {
  return useAtomValue(selectedProviderBalancesAtom(walletAddress));
};
