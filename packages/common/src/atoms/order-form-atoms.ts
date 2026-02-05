import { Atom, Registry, Result } from "@effect-atom/atom-react";
import { FormBuilder, FormReact } from "@lucas-barake/effect-form-react";
import { Number as _Number, Effect, Schema } from "effect";
import { AmountField, type TPOrSLSettings } from "../components";
import { isWalletConnected, type WalletConnected } from "../domain";
import {
  calcBaseAmountFromUsd,
  calculateMargin,
  calculatePositionSize,
  clampPercent,
  getLiquidationPrice,
  getMaxLeverage,
  MIN_LEVERAGE,
  percentOf,
  round,
  valueFromPercent,
} from "../lib";
import {
  ApiClientService,
  ApiSchemas,
  type ApiTypes,
  runtimeAtom,
} from "../services";
import { actionAtom } from "./actions-atoms";
import { tpSlArgument } from "./edit-position-atoms";
import { selectedProviderBalancesAtom } from "./portfolio-atoms";
import { selectedProviderAtom } from "./providers-atoms";
import { walletAtom } from "./wallet-atom";

// Constants
export const ORDER_SLIDER_STOPS = [0, 25, 50, 75, 100];

// Types
export type OrderType = "market" | "limit";
export type OrderSide = ApiTypes.PositionDtoSide;

// Schemas
export const LeverageRangesSchema = Schema.Data(
  ApiSchemas.MarketDto.fields.leverageRange,
).pipe(Schema.brand("LeverageRange"));

// Order Type Atom
export const orderTypeAtom = Atom.writable<OrderType, OrderType>(
  () => "market",
  (ctx, value) => ctx.setSelf(value),
);

// Order Side Atom
export const orderSideAtom = Atom.writable<OrderSide, OrderSide>(
  () => "long",
  (ctx, value) => ctx.setSelf(value),
);

// Leverage Atom (family keyed by leverage ranges)
export const leverageAtom = Atom.family(
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

// TP/SL Settings Atom
export const tpOrSLSettingsAtom = Atom.writable<TPOrSLSettings, TPOrSLSettings>(
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

// Limit Price Atom
export const limitPriceAtom = Atom.writable<number | null, number | null>(
  () => null,
  (ctx, value) => ctx.setSelf(value),
);

// Order Form Atom (family keyed by leverage ranges)
export const orderFormAtom = Atom.family(
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
            .get(selectedProviderBalancesAtom(wallet.currentAccount.address))
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
          market: ApiSchemas.MarketDto;
          side: ApiTypes.PositionDtoSide;
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

          const stopLossPrice = tpSlArgument(tpOrSLSettings.stopLoss);
          const takeProfitPrice = tpSlArgument(tpOrSLSettings.takeProfit);

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

    const setAmountFieldAtom = OrderForm.setValue(OrderForm.fields.Amount);
    const amountFieldAtom = OrderForm.getFieldValue(OrderForm.fields.Amount);

    return Atom.readable(() => ({
      form: OrderForm,
      setAmountFieldAtom,
      amountFieldAtom,
    }));
  },
);

// Helper functions for order calculations
export const getOrderCalculations = (
  amount: number,
  leverage: number,
  market: ApiSchemas.MarketDto,
  side: ApiTypes.PositionDtoSide,
) => {
  const cryptoAmount = calcBaseAmountFromUsd({
    usdAmount: amount,
    priceUsd: market.markPrice,
  });

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

// Helper function for percentage change
export const calculateOrderPositionSize = (
  providerBalance: { availableBalance: number },
  leverage: number,
  percentage: number,
) => {
  const clampedValue = clampPercent(percentage);
  const marginToUse = valueFromPercent({
    total: providerBalance.availableBalance,
    percent: clampedValue,
  });
  const positionSize = calculatePositionSize({
    margin: marginToUse,
    leverage,
  });

  return round(positionSize);
};

// Helper function for calculating percentage from amount
export const calculateOrderPercentage = (
  amount: number,
  leverage: number,
  availableBalance: number,
) => {
  const margin = calculateMargin({ positionSize: amount, leverage });
  const percentage = clampPercent(
    percentOf({ part: margin, whole: availableBalance }),
  );

  return Math.round(percentage);
};
