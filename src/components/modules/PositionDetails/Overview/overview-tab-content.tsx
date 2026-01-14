import { Card, CardSection } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";
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

function formatFundingRate(rate: string): string {
  const rateNum = Number.parseFloat(rate) * 100;
  return `${rateNum.toFixed(4)}%`;
}

function getFundingCountdown(intervalHours: number): string {
  const now = new Date();
  const minutesIntoHour = now.getMinutes();
  const secondsIntoMinute = now.getSeconds();

  // Calculate time until next funding (assuming funding happens at the start of each interval)
  const minutesUntilNextHour = 60 - minutesIntoHour;
  const hoursUntilFunding =
    (intervalHours - (now.getHours() % intervalHours)) % intervalHours;
  const totalMinutes = hoursUntilFunding * 60 + minutesUntilNextHour - 1;
  const seconds = 60 - secondsIntoMinute;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function OverviewTabContent({ market }: { market: MarketDto }) {
  // Calculate 24h high/low from current price and percentage change
  const currentPrice = market.markPrice;
  const priceChange24h = market.priceChange24h;

  // Estimate high/low based on price movement (simplified)
  const estimatedLow = currentPrice - Math.abs(priceChange24h);
  const estimatedHigh = currentPrice + Math.abs(priceChange24h);

  const fundingRateNum = Number.parseFloat(market.fundingRate) * 100;
  const isFundingPositive = fundingRateNum >= 0;

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
      <CardSection position="last" className="flex flex-col gap-2.5">
        <span className="text-gray-2 text-xs font-semibold tracking-tight">
          Funding rate
        </span>
        <span className="text-white text-base font-semibold tracking-tight">
          <span
            className={
              isFundingPositive ? "text-accent-green" : "text-accent-red"
            }
          >
            {formatFundingRate(market.fundingRate)}
          </span>{" "}
          <span className="font-normal">
            ({getFundingCountdown(market.fundingRateIntervalHours)})
          </span>
        </span>
      </CardSection>
    </Card>
  );
}
