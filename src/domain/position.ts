import type { PositionDto } from "@/services/api-client/api-schemas";

export const getPriceChangePercent = ({
  currentPrice,
  pastOrFuturePrice,
}: {
  currentPrice: number;
  pastOrFuturePrice: number;
}) => {
  if (pastOrFuturePrice === 0) return 100;
  return ((currentPrice - pastOrFuturePrice) / pastOrFuturePrice) * 100;
};

export const getPositionChangePercent = (position: PositionDto) =>
  getPriceChangePercent({
    currentPrice: position.markPrice,
    pastOrFuturePrice: position.entryPrice,
  });

export const getCloseCalculations = (
  position: PositionDto,
  closePercentage: number,
) => {
  const ratio = closePercentage / 100;
  const sizeNum = Number.parseFloat(position.size);
  const positionValue = position.markPrice * sizeNum;
  const closeValue = positionValue * ratio;
  const marginReturn = position.margin * ratio;
  const pnlReturn = position.unrealizedPnl * ratio;
  const youWillReceive = marginReturn + pnlReturn;
  const closeSize = sizeNum * ratio;
  const closeSizeInMarketPrice = (closeSize * position.markPrice).toFixed(6);

  return {
    closeValue,
    marginReturn,
    pnlReturn,
    youWillReceive,
    closeSize,
    closeSizeInMarketPrice,
  };
};

export const getLiquidationPrice = ({
  currentPrice,
  leverage,
}: {
  currentPrice: number;
  leverage: number;
}) => currentPrice * (1 - 1 / leverage);

export const getPriceChangePercentToLiquidation = ({
  currentPrice,
  liquidationPrice,
}: {
  currentPrice: number;
  liquidationPrice: number;
}) => {
  return getPriceChangePercent({
    currentPrice,
    pastOrFuturePrice: liquidationPrice,
  });
};

export const MIN_LEVERAGE = 1;
export const MAX_LEVERAGE = 40;

export const getLeveragePercent = ({
  leverage,
  maxLeverage,
}: {
  leverage: number;
  maxLeverage: number;
}) => ((leverage - MIN_LEVERAGE) / (maxLeverage - MIN_LEVERAGE)) * 100;

export const calculateMargin = ({
  positionSize,
  leverage,
}: {
  positionSize: number;
  leverage: number;
}) => {
  if (leverage <= 0) return positionSize;
  return positionSize / leverage;
};

export const calculatePositionSize = ({
  margin,
  leverage,
}: {
  margin: number;
  leverage: number;
}) => margin * leverage;
