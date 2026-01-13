import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardSection } from "@/components/ui/card";

// Crypto token logos from public sources
const CRYPTO_LOGOS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
};

// Network badge (showing short position indicator)
const POSITION_BADGE =
  "https://assets.coingecko.com/coins/images/34367/small/Hyperliquid.jpeg";

export interface Position {
  id: string;
  symbol: string;
  name: string;
  leverage: string;
  currentPrice: string;
  change24h: number;
  entry: string;
  marketPrice: string;
  liqPrice: string;
  size: string;
  pnl: number;
  pnlPercent: number;
}

export interface Order {
  id: string;
  type: "Limit" | "Market" | "Stop";
  date: string;
  value: string;
  size: string;
  entry: string;
  marketPrice: string;
  liqPrice: string;
}

// Dummy data for positions
export const DUMMY_POSITIONS: Position[] = [
  {
    id: "1",
    symbol: "BTC",
    name: "Bitcoin",
    leverage: "40x",
    currentPrice: "$100,445.00",
    change24h: -2.6,
    entry: "100.445",
    marketPrice: "100.445",
    liqPrice: "100.445",
    size: "0.0001 BTC",
    pnl: -1.6,
    pnlPercent: -1.6,
  },
  {
    id: "2",
    symbol: "ETH",
    name: "Ethereum",
    leverage: "40x",
    currentPrice: "$2 406,36",
    change24h: -2.6,
    entry: "100.445",
    marketPrice: "100.445",
    liqPrice: "100.445",
    size: "0.01 ETH",
    pnl: -0.8,
    pnlPercent: -0.8,
  },
];

// Dummy data for orders
export const DUMMY_ORDERS: Order[] = [
  {
    id: "1",
    type: "Limit",
    date: "18 Nov at 9:56 PM",
    value: "$10,38",
    size: "0.0043 ETH",
    entry: "100.445",
    marketPrice: "100.445",
    liqPrice: "100.445",
  },
];

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  return (
    <Card>
      {/* Top section with order type and value */}
      <CardSection position="first" className="flex items-center gap-2">
        {/* Order info */}
        <div className="flex-1 flex flex-col gap-2.5 items-start justify-center min-w-0">
          <span className="text-white font-semibold text-base tracking-tight">
            {order.type}
          </span>
          <span className="text-gray-2 font-semibold text-sm tracking-tight">
            {order.date}
          </span>
        </div>

        {/* Value and size */}
        <div className="flex flex-col items-end justify-center gap-2.5">
          <span className="text-white font-semibold text-base tracking-tight">
            {order.value}
          </span>
          <span className="text-gray-2 font-semibold text-sm tracking-tight">
            {order.size}
          </span>
        </div>
      </CardSection>

      {/* Bottom section with entry/market/liq prices */}
      <CardSection position="last" className="flex items-start gap-4">
        <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
          <span className="text-gray-2 font-semibold text-xs tracking-tight">
            Entry
          </span>
          <span className="text-white font-semibold text-base tracking-tight">
            {order.entry}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
          <span className="text-gray-2 font-semibold text-xs tracking-tight">
            Market place
          </span>
          <span className="text-white font-semibold text-base tracking-tight">
            {order.marketPrice}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
          <span className="text-gray-2 font-semibold text-xs tracking-tight">
            Liq. Price
          </span>
          <span className="text-white font-semibold text-base tracking-tight">
            {order.liqPrice}
          </span>
        </div>
      </CardSection>
    </Card>
  );
}

interface PositionCardProps {
  position: Position;
}

function PositionCard({ position }: PositionCardProps) {
  const navigate = useNavigate();
  const isPositive = position.change24h >= 0;
  const logo = CRYPTO_LOGOS[position.symbol];

  const handleClick = () => {
    navigate({
      to: "/position-details/$positionId",
      params: { positionId: position.id },
    });
  };

  return (
    <button type="button" onClick={handleClick} className="w-full text-left">
      <Card>
        {/* Top section with token info and price */}
        <CardSection position="first" className="p-4 flex items-center gap-2">
          {/* Token icon with badge */}
          <div className="relative shrink-0 size-9">
            <img
              src={logo}
              alt={position.symbol}
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-background overflow-hidden">
              <img
                src={POSITION_BADGE}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Token info */}
          <div className="flex-1 flex flex-col gap-2 items-start justify-center min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="text-white font-semibold text-base tracking-tight">
                {position.symbol}
              </span>
              <span className="bg-gray-4 px-1.5 py-1 rounded text-[11px] text-white text-center leading-tight">
                {position.leverage}
              </span>
            </div>
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              {position.name}
            </span>
          </div>

          {/* Price and change */}
          <div className="flex flex-col items-end justify-center gap-2.5">
            <span className="text-white font-semibold text-base tracking-tight">
              {position.currentPrice}
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
        </CardSection>

        {/* Bottom section with entry/market/liq prices */}
        <CardSection position="last" className="flex items-start gap-4">
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              Entry
            </span>
            <span className="text-white font-semibold text-base tracking-tight">
              {position.entry}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              Market place
            </span>
            <span className="text-white font-semibold text-base tracking-tight">
              {position.marketPrice}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              Liq. Price
            </span>
            <span className="text-white font-semibold text-base tracking-tight">
              {position.liqPrice}
            </span>
          </div>
        </CardSection>
      </Card>
    </button>
  );
}

interface PositionsProps {
  positions?: Position[];
  orders?: Order[];
  totalValue?: string;
  totalSize?: string;
  totalPnlPercent?: number;
}

export function Positions({
  positions = DUMMY_POSITIONS,
  orders = DUMMY_ORDERS,
  totalValue = "$330.00",
  totalSize = "0.0001 BTC",
  totalPnlPercent = -1.6,
}: PositionsProps) {
  const [activeTab, setActiveTab] = useState<"positions" | "orders">(
    "positions",
  );
  const isPnlPositive = totalPnlPercent >= 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Total value section */}
      <div className="flex items-center justify-between pb-5">
        <span className="text-white font-semibold text-[30px] tracking-tight leading-tight">
          {totalValue}
        </span>
        <div className="flex flex-col items-end justify-center gap-2.5">
          <span className="text-gray-2 font-semibold text-sm tracking-tight">
            {totalSize}
          </span>
          <span
            className={`font-semibold text-sm tracking-tight ${
              isPnlPositive ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {isPnlPositive ? "+" : ""}
            {totalPnlPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Positions/Orders tabs */}
      <div className="bg-[#121314] h-12 p-[5px] rounded-xl flex gap-[5px]">
        <button
          type="button"
          onClick={() => setActiveTab("positions")}
          className={`flex-1 h-[36px] rounded-xl flex items-center justify-center font-semibold text-sm tracking-tight transition-colors ${
            activeTab === "positions"
              ? "bg-white text-black border border-white"
              : "bg-transparent text-gray-2 hover:text-white"
          }`}
        >
          Positions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex-1 h-[36px] rounded-xl flex items-center justify-center font-semibold text-sm tracking-tight transition-colors ${
            activeTab === "orders"
              ? "bg-white text-black border border-white"
              : "bg-transparent text-gray-2 hover:text-white"
          }`}
        >
          Orders
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 pt-5">
        {activeTab === "positions" ? (
          positions.length > 0 ? (
            positions.map((position) => (
              <PositionCard key={position.id} position={position} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-foreground font-semibold text-base">
                No open positions
              </p>
              <p className="text-gray-1 text-sm text-center">
                Start trading to see your positions here
              </p>
            </div>
          )
        ) : orders.length > 0 ? (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-foreground font-semibold text-base">
              No open orders
            </p>
            <p className="text-gray-1 text-sm text-center">
              Your pending orders will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Positions;
