import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { FormBuilder, FormReact } from "@lucas-barake/effect-form-react";
import { Number as _Number, Effect, Option, Schema } from "effect";
import { actionAtom } from "@/atoms/actions-atoms";
import { selectedProviderBalancesAtom } from "@/atoms/portfolio-atoms";
import { selectedProviderAtom } from "@/atoms/providers-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { AmountField } from "@/components/molecules/forms";
import type { TPOrSLSettings } from "@/components/molecules/tp-sl-dialog";
import { getMaxLeverage } from "@/domain/market";
import {
  calculateMargin,
  getLiquidationPrice,
  MIN_LEVERAGE,
} from "@/domain/position";
import { isWalletConnected, type WalletConnected } from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import {
  type ArgumentsDto,
  MarketDto,
} from "@/services/api-client/api-schemas";
import type { PositionDtoSide } from "@/services/api-client/client-factory";
import { runtimeAtom } from "@/services/runtime";

export type OrderType = "market" | "limit";

export const SLIDER_STOPS = [0, 25, 50, 75, 100];

const orderTypeAtom = Atom.writable<OrderType, OrderType>(
  () => "market",
  (ctx, value) => ctx.setSelf(value),
);

export const LeverageRangesSchema = Schema.Data(
  MarketDto.fields.leverageRange,
).pipe(Schema.brand("LeverageRange"));

const leverageAtom = Atom.family(
  (leverageRanges: typeof LeverageRangesSchema.Type) =>
    Atom.writable(
      () => getMaxLeverage(leverageRanges),
      (ctx, value: number) =>
        ctx.setSelf(
          _Number.clamp({
            minimum: MIN_LEVERAGE,
            maximum: getMaxLeverage(leverageRanges),
          })(value),
        ),
    ),
);

const tpOrSLSettingsAtom = Atom.writable<TPOrSLSettings, TPOrSLSettings>(
  () => ({
    takeProfit: {
      option: null,
      triggerPrice: null,
      percentage: null,
    },
    stopLoss: {
      option: null,
      triggerPrice: null,
      percentage: null,
    },
  }),
  (ctx, value) => ctx.setSelf(value),
);

const limitPriceAtom = Atom.writable<number | null, number | null>(
  () => null,
  (ctx, value) => ctx.setSelf(value),
);

export const useOrderType = () => {
  const orderType = useAtomValue(orderTypeAtom);
  const setOrderType = useAtomSet(orderTypeAtom);

  return {
    orderType,
    setOrderType,
  };
};

export const useLeverage = (
  leverageRanges: typeof LeverageRangesSchema.Type,
) => {
  const leverage = useAtomValue(leverageAtom(leverageRanges));
  const setLeverage = useAtomSet(leverageAtom(leverageRanges));

  return {
    leverage,
    setLeverage,
  };
};

export const useTPOrSLSettings = () => {
  const tpOrSLSettings = useAtomValue(tpOrSLSettingsAtom);
  const setTPOrSLSettings = useAtomSet(tpOrSLSettingsAtom);

  return {
    tpOrSLSettings,
    setTPOrSLSettings,
  };
};

export const useLimitPrice = () => {
  const limitPrice = useAtomValue(limitPriceAtom);
  const setLimitPrice = useAtomSet(limitPriceAtom);

  return {
    limitPrice,
    setLimitPrice,
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

export const formAtom = Atom.family(
  (leverageRanges: typeof LeverageRangesSchema.Type) => {
    const orderFormBuilder = FormBuilder.empty
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
            .get(selectedProviderBalancesAtom(wallet))
            .pipe(Result.getOrElse(() => null));

          if (!providerBalance) {
            return { path: ["Amount"], message: "Missing provider balance" };
          }

          const leverage = registry.get(leverageAtom(leverageRanges));
          const requiredMargin = calculateMargin({
            positionSize: values.Amount,
            leverage,
          });

          if (requiredMargin > providerBalance.availableBalance) {
            return {
              path: ["Amount"],
              message: "Insufficient balance",
            };
          }
        }),
      );

    const OrderForm = FormReact.make(orderFormBuilder, {
      runtime: runtimeAtom,
      fields: { Amount: AmountField },
      onSubmit: (
        {
          wallet,
          market,
          side,
        }: {
          wallet: WalletConnected;
          market: MarketDto;
          side: PositionDtoSide;
        },
        { decoded },
      ) =>
        Effect.gen(function* () {
          const client = yield* ApiClientService;
          const registry = yield* Registry.AtomRegistry;

          const selectedProvider = registry
            .get(selectedProviderAtom)
            .pipe(Result.getOrElse(() => null));

          if (!selectedProvider) {
            return yield* Effect.dieMessage("No selected provider");
          }

          const leverage = registry.get(leverageAtom(leverageRanges));
          const orderType = registry.get(orderTypeAtom);
          const tpOrSLSettings = registry.get(tpOrSLSettingsAtom);

          const stopLossPrice: ArgumentsDto["stopLossPrice"] =
            tpOrSLSettings.stopLoss.triggerPrice &&
            tpOrSLSettings.stopLoss.option !== null
              ? tpOrSLSettings.stopLoss.triggerPrice
              : undefined;

          const takeProfitPrice: ArgumentsDto["takeProfitPrice"] =
            tpOrSLSettings.takeProfit.triggerPrice &&
            tpOrSLSettings.takeProfit.option !== null
              ? tpOrSLSettings.takeProfit.triggerPrice
              : undefined;

          const limitPrice =
            orderType === "limit" ? registry.get(limitPriceAtom) : undefined;

          const action = yield* client.ActionsControllerExecuteAction({
            providerId: selectedProvider.id,
            address: wallet.currentAccount.address,
            action: "open",
            args: {
              marketId: market.id,
              side,
              size: decoded.Amount.toString(),
              marginMode: "isolated",
              ...(stopLossPrice && { stopLossPrice }),
              ...(takeProfitPrice && { takeProfitPrice }),
              ...(leverage && { leverage }),
              ...(limitPrice && { limitPrice: limitPrice }),
            },
          });

          registry.set(actionAtom, action);
        }),
    });

    const useOrderForm = () => {
      const submit = useAtomSet(OrderForm.submit);
      const submitResult = useAtomValue(OrderForm.submit);

      return {
        submit,
        submitResult,
      };
    };

    const setAmountFieldAtom = OrderForm.setValue(OrderForm.fields.Amount);
    const amountFieldAtom = OrderForm.getFieldAtom(OrderForm.fields.Amount);

    const useHandlePercentageChange = (wallet: WalletConnected) => {
      const setAmount = useAtomSet(setAmountFieldAtom);
      const { providerBalance } = useProviderBalance(wallet);
      const { leverage } = useLeverage(leverageRanges);

      return {
        handlePercentageChange: (value: number) => {
          if (!providerBalance) return;

          const clampedValue = _Number.clamp({ minimum: 0, maximum: 100 })(
            value,
          );

          const marginToUse =
            (clampedValue / 100) * providerBalance.availableBalance;
          const positionSize = marginToUse * leverage;
          setAmount(parseFloat(positionSize.toFixed(2)).toString());
        },
      };
    };

    const useOrderAmount = () => {
      const amount = useAtomValue(amountFieldAtom).pipe(
        Option.map(Number),
        Option.filter((v) => !Number.isNaN(v)),
        Option.getOrElse(() => 0),
      );

      return { amount };
    };

    const useOrderPercentage = (
      wallet: WalletConnected,
      leverageRanges: typeof LeverageRangesSchema.Type,
    ) => {
      const amount = useAtomValue(amountFieldAtom).pipe(
        Option.map(Number),
        Option.filter((v) => !Number.isNaN(v)),
        Option.getOrElse(() => 0),
      );

      const { leverage } = useLeverage(leverageRanges);

      const providerBalance = useAtomValue(
        selectedProviderBalancesAtom(wallet),
      ).pipe(Result.getOrElse(() => null));

      if (!providerBalance) {
        return {
          percentage: 0,
        };
      }

      const margin = calculateMargin({ positionSize: amount, leverage });
      const percentage =
        Math.min(
          100,
          Math.max(0, (margin / providerBalance.availableBalance) * 100),
        ) || 0;

      return {
        percentage: Math.round(percentage),
      };
    };

    const useOrderCalculations = (
      market: MarketDto,
      side: PositionDtoSide,
    ) => {
      const { amount } = useOrderAmount();
      const { leverage } = useLeverage(
        Schema.decodeSync(LeverageRangesSchema)(market.leverageRange),
      );

      const cryptoAmount = amount / market.markPrice;

      const liquidationPrice = getLiquidationPrice({
        currentPrice: market.markPrice,
        leverage,
        side,
      });

      const margin = calculateMargin({ positionSize: amount, leverage });

      const feeRate = market.takerFee ? Number.parseFloat(market.takerFee) : 0;
      const fees = amount * feeRate;

      return {
        margin,
        amount,
        cryptoAmount,
        liquidationPrice,
        fees,
        leverage,
      };
    };

    const hooks = {
      useOrderForm,
      useOrderAmount,
      useOrderPercentage,
      useOrderCalculations,
      useHandlePercentageChange,
    };

    return Atom.readable(() => ({
      hooks,
      form: OrderForm,
    }));
  },
);
