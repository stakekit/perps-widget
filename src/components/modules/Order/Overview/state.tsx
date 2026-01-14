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
import { marketAtom } from "@/atoms/markets-atoms";
import { selectedProviderBalancesAtom } from "@/atoms/portfolio-atoms";
import { selectedProviderAtom } from "@/atoms/providers-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { AmountField } from "@/components/molecules/forms";
import type { TPOrSLSettings } from "@/components/molecules/tp-sl-dialog";
import {
  calculateMargin,
  getLiquidationPrice,
  MIN_LEVERAGE,
} from "@/domain/position";
import { isWalletConnected, type WalletConnected } from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import type {
  ArgumentsDto,
  MarketDto,
} from "@/services/api-client/api-schemas";
import type { PositionDtoSide } from "@/services/api-client/client-factory";
import { runtimeAtom } from "@/services/runtime";

export type OrderType = "market" | "limit";

export const MAX_LEVERAGE = 40;
export const DEFAULT_LEVERAGE = 40;
export const SLIDER_STOPS = [0, 25, 50, 75, 100];

const getMaxLeverarage = (market: MarketDto) => {
  const maxMarketLeverage = _Array.last(market.leverageRange).pipe(
    Option.map((v) => Number.parseFloat(v)),
    Option.filter((v) => !Number.isNaN(v)),
  );

  if (Option.isNone(maxMarketLeverage)) {
    return MAX_LEVERAGE;
  }

  return maxMarketLeverage.value;
};

const orderTypeAtom = Atom.writable<OrderType, OrderType>(
  () => "market",
  (ctx, value) => ctx.setSelf(value),
);

const leverageAtom = Atom.family((market: MarketDto) =>
  Atom.writable(
    () => getMaxLeverarage(market),
    (ctx, value: number) => {
      const max = getMaxLeverarage(market);

      if (value > max) {
        return ctx.setSelf(max);
      }

      if (value < MIN_LEVERAGE) {
        return ctx.setSelf(MIN_LEVERAGE);
      }

      return ctx.setSelf(value);
    },
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

const limitPriceAtom = Atom.writable<string, string>(
  () => "",
  (ctx, value) => ctx.setSelf(value),
);

// Hooks
export const useMarket = (marketId: string) => {
  const marketResult = useAtomValue(marketAtom(marketId));
  const market = marketResult.pipe(Result.getOrElse(() => null));

  return {
    market,
    isLoading: Result.isWaiting(marketResult),
  };
};

export const useOrderType = () => {
  const orderType = useAtomValue(orderTypeAtom);
  const setOrderType = useAtomSet(orderTypeAtom);

  return {
    orderType,
    setOrderType,
  };
};

export const useLeverage = (market: MarketDto) => {
  const leverage = useAtomValue(leverageAtom(market));
  const setLeverage = useAtomSet(leverageAtom(market));

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

export const getMaxLeverage = (market: MarketDto | null): number => {
  if (!market || market.leverageRange.length === 0) {
    return MAX_LEVERAGE;
  }
  const maxLev = Number.parseFloat(
    market.leverageRange[market.leverageRange.length - 1],
  );
  return Number.isNaN(maxLev) ? MAX_LEVERAGE : maxLev;
};

export const formAtom = Atom.family((market: MarketDto) => {
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

        const leverage = registry.get(leverageAtom(market));
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
      }: { wallet: WalletConnected; market: MarketDto; side: PositionDtoSide },
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

        const leverage = registry.get(leverageAtom(market));
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

        let limitPrice: number | undefined;
        if (orderType === "limit") {
          const limitPriceStr = registry.get(limitPriceAtom);
          if (limitPriceStr) {
            const parsedLimitPrice = Number.parseFloat(limitPriceStr);
            if (!Number.isNaN(parsedLimitPrice) && parsedLimitPrice > 0) {
              limitPrice = parsedLimitPrice;
            }
          }
          if (!limitPrice) {
            limitPrice = market.markPrice;
          }
        }

        const action = yield* client.ActionsControllerExecuteAction({
          providerId: selectedProvider.id,
          address: wallet.currentAccount.address,
          action: "open",
          args: {
            marketId: market.id,
            side,
            amount: decoded.Amount.toString(),
            marginMode: "isolated",
            ...(stopLossPrice && { stopLossPrice }),
            ...(takeProfitPrice && { takeProfitPrice }),
            ...(leverage && { leverage }),
            ...(limitPrice && { limitPrice }),
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

  const useSetOrderAmount = () => {
    const setAmount = useAtomSet(setAmountFieldAtom);

    return {
      setAmount,
    };
  };

  const useOrderAmount = () => {
    const amount = useAtomValue(amountFieldAtom).pipe(
      Option.map(Number),
      Option.filter((v) => !Number.isNaN(v)),
      Option.getOrElse(() => 0),
    );

    return {
      amount,
    };
  };

  const useOrderPercentage = (wallet: WalletConnected, market: MarketDto) => {
    const amount = useAtomValue(amountFieldAtom).pipe(
      Option.map(Number),
      Option.filter((v) => !Number.isNaN(v)),
      Option.getOrElse(() => 0),
    );

    const { leverage } = useLeverage(market);

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

  const useOrderCalculations = (market: MarketDto) => {
    const { amount } = useOrderAmount();
    const { leverage } = useLeverage(market);

    const cryptoAmount = amount / market.markPrice;

    const liquidationPrice = getLiquidationPrice({
      currentPrice: market.markPrice,
      leverage,
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
    useSetOrderAmount,
    useOrderAmount,
    useOrderPercentage,
    useOrderCalculations,
  };

  return Atom.readable(() => ({
    hooks,
    form: OrderForm,
  }));
});
