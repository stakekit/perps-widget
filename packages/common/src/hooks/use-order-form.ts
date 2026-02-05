import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Option, Schema } from "effect";
import {
  calculateOrderPercentage,
  calculateOrderPositionSize,
  getOrderCalculations,
  LeverageRangesSchema,
  leverageAtom,
  limitPriceAtom,
  orderFormAtom,
  orderSideAtom,
  orderTypeAtom,
  tpOrSLSettingsAtom,
} from "../atoms/order-form-atoms";
import {
  positionsAtom,
  selectedProviderBalancesAtom,
} from "../atoms/portfolio-atoms";
import type { WalletConnected } from "../domain";
import type { ApiSchemas, ApiTypes } from "../services";

export const useOrderType = () => {
  const orderType = useAtomValue(orderTypeAtom);
  const setOrderType = useAtomSet(orderTypeAtom);

  return {
    orderType,
    setOrderType,
  };
};

export const useOrderSide = () => {
  const orderSide = useAtomValue(orderSideAtom);
  const setOrderSide = useAtomSet(orderSideAtom);

  return {
    orderSide,
    setOrderSide,
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

export const useOrderProviderBalance = (wallet: WalletConnected) => {
  const providerBalance = useAtomValue(
    selectedProviderBalancesAtom(wallet.currentAccount.address),
  ).pipe(Result.getOrElse(() => null));

  return {
    providerBalance,
  };
};

export const useCurrentPosition = (
  wallet: WalletConnected,
  marketId: string,
) => {
  const positions = useAtomValue(
    positionsAtom(wallet.currentAccount.address),
  ).pipe(Result.getOrElse(() => []));

  const currentPosition = positions.find(
    (position) => position.marketId === marketId,
  );

  return {
    currentPosition: currentPosition ?? null,
  };
};

// Hooks that depend on orderFormAtom
export const useOrderFormSubmit = (
  leverageRanges: typeof LeverageRangesSchema.Type,
) => {
  const { form } = useAtomValue(orderFormAtom(leverageRanges));
  const submit = useAtomSet(form.submit);
  const submitResult = useAtomValue(form.submit);

  return {
    submit,
    submitResult,
  };
};

export const useOrderAmount = (
  leverageRanges: typeof LeverageRangesSchema.Type,
) => {
  const { amountFieldAtom } = useAtomValue(orderFormAtom(leverageRanges));
  const amount = useAtomValue(amountFieldAtom).pipe(
    Option.map(Number),
    Option.filter((v) => !Number.isNaN(v)),
    Option.getOrElse(() => 0),
  );

  return { amount };
};

export const useHandlePercentageChange = (
  wallet: WalletConnected,
  leverageRanges: typeof LeverageRangesSchema.Type,
) => {
  const { setAmountFieldAtom } = useAtomValue(orderFormAtom(leverageRanges));
  const setAmount = useAtomSet(setAmountFieldAtom);
  const { providerBalance } = useOrderProviderBalance(wallet);
  const { leverage } = useLeverage(leverageRanges);

  return {
    handlePercentageChange: (value: number) => {
      if (!providerBalance) return;

      const positionSize = calculateOrderPositionSize(
        providerBalance,
        leverage,
        value,
      );

      setAmount(positionSize.toString());
    },
  };
};

export const useOrderPercentage = (
  wallet: WalletConnected,
  leverageRanges: typeof LeverageRangesSchema.Type,
) => {
  const { amount } = useOrderAmount(leverageRanges);
  const { leverage } = useLeverage(leverageRanges);

  const providerBalance = useAtomValue(
    selectedProviderBalancesAtom(wallet.currentAccount.address),
  ).pipe(Result.getOrElse(() => null));

  if (!providerBalance) {
    return {
      percentage: 0,
    };
  }

  const percentage = calculateOrderPercentage(
    amount,
    leverage,
    providerBalance.availableBalance,
  );

  return {
    percentage,
  };
};

export const useOrderCalculations = (
  market: ApiSchemas.MarketDto,
  side: ApiTypes.PositionDtoSide,
  leverageRanges: typeof LeverageRangesSchema.Type,
) => {
  const { amount } = useOrderAmount(leverageRanges);
  const { leverage } = useLeverage(leverageRanges);

  return getOrderCalculations(amount, leverage, market, side);
};

// Re-export from order-form-atoms for convenience
export {
  LeverageRangesSchema,
  ORDER_SLIDER_STOPS,
  type OrderSide,
  type OrderType,
  orderFormAtom,
} from "../atoms/order-form-atoms";

// Helper to decode leverage ranges from market
export const decodeLeverageRanges = (
  leverageRange: ApiSchemas.MarketDto["leverageRange"],
) => Schema.decodeSync(LeverageRangesSchema)(leverageRange);

export const useProviderBalance = (wallet: WalletConnected) => {
  const providerBalance = useAtomValue(
    selectedProviderBalancesAtom(wallet.currentAccount.address),
  ).pipe(Result.getOrElse(() => null));

  return {
    providerBalance,
  };
};
