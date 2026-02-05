import { Card, CardSection, Text } from "@yieldxyz/perps-common/components";
import {
  estimateLowHighFromAbsoluteChange,
  formatAmount,
  formatCompactUsdAmount,
  formatRate,
} from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";

export function OverviewTabContent({ market }: { market: ApiTypes.MarketDto }) {
  const currentPrice = market.markPrice;
  const priceChange24h = market.priceChange24h;

  const { low: estimatedLow, high: estimatedHigh } =
    estimateLowHighFromAbsoluteChange({
      currentPrice,
      priceChange24h,
    });

  return (
    <Card>
      <CardSection position="first" className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            24h low
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {formatAmount(estimatedLow)}
          </Text>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            24h high
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {formatAmount(estimatedHigh)}
          </Text>
        </div>
      </CardSection>
      <CardSection position="middle" className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            24h volume
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {formatCompactUsdAmount(market.volume24h)}
          </Text>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Open Interest
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {formatCompactUsdAmount(market.openInterest)}
          </Text>
        </div>
      </CardSection>
      <CardSection position="middle" className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Funding Rate
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {formatRate(market.fundingRate, { maximumFractionDigits: 4 })}
          </Text>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Funding Interval
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {market.fundingRateIntervalHours}h
          </Text>
        </div>
      </CardSection>
      <CardSection position="last" className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Maker Fee
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {market.makerFee ? formatRate(market.makerFee) : "-"}
          </Text>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Taker Fee
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {market.takerFee ? formatRate(market.takerFee) : "-"}
          </Text>
        </div>
      </CardSection>
    </Card>
  );
}
