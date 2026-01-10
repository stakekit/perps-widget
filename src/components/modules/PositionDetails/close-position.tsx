import { Link, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// Mock position data (in real app, this would come from the position state)
const MOCK_POSITIONS: Record<
  string,
  {
    symbol: string;
    price: string;
    change24h: number;
    positionValue: number;
    margin: number;
    pnl: number;
    fees: number;
  }
> = {
  "1": {
    symbol: "BTC",
    price: "100,445.00",
    change24h: 5.6,
    positionValue: 100,
    margin: 1.8,
    pnl: 0.45,
    fees: 0.03,
  },
  "1-hl": {
    symbol: "BTC",
    price: "100,245.00",
    change24h: 5.6,
    positionValue: 100,
    margin: 1.8,
    pnl: 0.45,
    fees: 0.03,
  },
  "1-arb": {
    symbol: "BTC",
    price: "100,355.00",
    change24h: 2.7,
    positionValue: 100,
    margin: 1.8,
    pnl: 0.45,
    fees: 0.03,
  },
  "2": {
    symbol: "ETH",
    price: "3,104.78",
    change24h: 4.71,
    positionValue: 100,
    margin: 1.8,
    pnl: 0.45,
    fees: 0.03,
  },
  "3": {
    symbol: "SOL",
    price: "138.53",
    change24h: 9.38,
    positionValue: 100,
    margin: 1.8,
    pnl: 0.45,
    fees: 0.03,
  },
};

const SLIDER_STOPS = [0, 25, 50, 75, 100];

export function ClosePosition() {
  const { positionId } = useParams({
    from: "/position-details/$positionId/close",
  });
  const [closePercent, setClosePercent] = useState(25);

  // Get position data (fallback to default if not found)
  const position = MOCK_POSITIONS[positionId] || MOCK_POSITIONS["1"];
  const isPositive = position.change24h >= 0;

  // Calculate values based on close percentage
  const calculations = useMemo(() => {
    const ratio = closePercent / 100;
    const closeValue = position.positionValue * ratio;
    const marginReturn = position.margin * ratio;
    const pnlReturn = position.pnl * ratio;
    const feesDeducted = position.fees * ratio;
    const youWillReceive = marginReturn + pnlReturn - feesDeducted;
    const btcAmount = closeValue / 100445; // Rough BTC conversion

    return {
      closeValue,
      marginReturn,
      pnlReturn,
      feesDeducted,
      youWillReceive,
      btcAmount,
    };
  }, [closePercent, position]);

  // Handle stop click
  const handleStopClick = (value: number) => {
    setClosePercent(value);
  };

  return (
    <div className="flex flex-col gap-28">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 pb-4">
          <Link
            to="/position-details/$positionId"
            params={{ positionId }}
            className="flex items-center justify-center shrink-0"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Link>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="text-white font-semibold text-base tracking-tight">
                Close amount
              </span>
              <span className="bg-black/70 px-1.5 py-1 rounded-[5px] text-[11px] text-white leading-none opacity-0">
                40x
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-2 font-semibold text-sm tracking-tight">
                ${position.price}
              </span>
              <span
                className={`font-semibold text-xs tracking-tight ${
                  isPositive ? "text-accent-green" : "text-accent-red"
                }`}
              >
                {isPositive ? "+" : ""}
                {position.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-6">
          {/* Amount Display */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <p className="text-gray-2 text-sm font-semibold tracking-tight text-center">
              Select amount to close
            </p>
            <p className="text-white text-[44px] font-semibold tracking-[-1.76px] leading-none text-center">
              ${calculations.closeValue.toFixed(2)}
            </p>
            <p className="text-gray-2 text-sm font-semibold tracking-tight text-center">
              {calculations.btcAmount.toFixed(6)}BTC
            </p>
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-2.5 pt-9">
            <Slider
              value={closePercent}
              onValueChange={(value) =>
                setClosePercent(Array.isArray(value) ? value[0] : value)
              }
              min={0}
              max={100}
              thumbSize="round"
              showStops
              stops={SLIDER_STOPS}
              onStopClick={handleStopClick}
            />

            {/* Percentage Labels */}
            <div className="flex justify-between text-gray-2 text-xs font-semibold tracking-tight">
              {SLIDER_STOPS.map((stop) => (
                <button
                  type="button"
                  key={stop}
                  className={`cursor-pointer hover:text-white transition-colors ${
                    stop === 0
                      ? "w-12 text-left"
                      : stop === 100
                        ? "w-12 text-right"
                        : "flex-1 text-center"
                  }`}
                  onClick={() => handleStopClick(stop)}
                >
                  {stop}%
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col pt-9">
            {/* Spacer */}
            <div className="h-2.5" />

            {/* Margin Row */}
            <div className="flex items-center justify-between py-4 rounded-t-2xl">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                Margin
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-gray-2 text-sm font-normal tracking-tight">
                  ${calculations.marginReturn.toFixed(2)}
                </span>
                <span className="text-accent-green text-sm font-normal tracking-tight">
                  +${calculations.pnlReturn.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Fees Row */}
            <div className="flex items-center justify-between py-[18px] border-t border-[#090909]">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                Fees
              </span>
              <span className="text-gray-2 text-sm font-normal tracking-tight">
                -${calculations.feesDeducted.toFixed(2)}
              </span>
            </div>

            {/* You will receive Row */}
            <div className="flex items-center justify-between py-[18px] border-t border-[#090909] rounded-b-2xl">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                You will receive
              </span>
              <span className="text-gray-2 text-sm font-normal tracking-tight">
                ${calculations.youWillReceive.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <Button className="w-full h-14 bg-white text-black hover:bg-white/90 text-base font-semibold">
        Close position
      </Button>
    </div>
  );
}

export default ClosePosition;
