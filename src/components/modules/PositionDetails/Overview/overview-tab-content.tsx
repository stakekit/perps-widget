import { Card, CardSection } from "@/components/ui/card";
import { formatAmount, formatRate } from "@/lib/utils";
import type { MarketDto } from "@/services/api-client/client-factory";

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `$${(volume / 1_000_000_000).toFixed(2)}B`;
  }
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(2)}K`;
  }
  return formatAmount(volume);
}

export function OverviewTabContent({ market }: { market: MarketDto }) {
  const currentPrice = market.markPrice;
  const priceChange24h = market.priceChange24h;

  const estimatedLow = currentPrice - Math.abs(priceChange24h);
  const estimatedHigh = currentPrice + Math.abs(priceChange24h);

  return (
    <Card>
      <CardSection position="first" className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            24h low
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {formatAmount(estimatedLow)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            24h high
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {formatAmount(estimatedHigh)}
          </span>
        </div>
      </CardSection>
      <CardSection position="middle" className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            24h volume
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {formatVolume(market.volume24h)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Open Interest
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {formatVolume(market.openInterest)}
          </span>
        </div>
      </CardSection>
      <CardSection position="middle" className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Funding Rate
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {formatRate(market.fundingRate, { maximumFractionDigits: 4 })}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Funding Interval
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {market.fundingRateIntervalHours}h
          </span>
        </div>
      </CardSection>
      <CardSection position="last" className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Maker Fee
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {market.makerFee ? formatRate(market.makerFee) : "-"}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Taker Fee
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {market.takerFee ? formatRate(market.takerFee) : "-"}
          </span>
        </div>
      </CardSection>
    </Card>
  );
}
