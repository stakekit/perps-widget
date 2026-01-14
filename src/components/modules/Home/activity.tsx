import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPercentage } from "@/lib/utils";

// Crypto token logos from public sources
const CRYPTO_LOGOS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
};

export type ActivityFilter = "trades" | "orders" | "funding";

export interface Trade {
  id: string;
  symbol: string;
  amount: string;
  percentChange: number;
  date: string;
}

export interface Order {
  id: string;
  symbol: string;
  type: string;
  amount: string;
  status: "Filled" | "Canceled" | "Pending";
  date: string;
}

export interface FundingEvent {
  id: string;
  symbol: string;
  action: "Received" | "Sent";
  amount: string;
  isPositive: boolean;
  date: string;
}

// Dummy data for trades
export const DUMMY_TRADES: Trade[] = [
  {
    id: "1",
    symbol: "BTC",
    amount: "0.0001 BTC",
    percentChange: -1.6,
    date: "Today",
  },
  {
    id: "2",
    symbol: "ETH",
    amount: "0.211 ETH",
    percentChange: 4.71,
    date: "Today",
  },
  {
    id: "3",
    symbol: "BTC",
    amount: "0.0001 BTC",
    percentChange: -2.3,
    date: "Oct 30",
  },
  {
    id: "4",
    symbol: "BTC",
    amount: "0.0001 BTC",
    percentChange: -2.3,
    date: "Oct 28",
  },
];

// Dummy data for orders
export const DUMMY_ORDERS: Order[] = [
  {
    id: "1",
    symbol: "BTC",
    type: "Long market",
    amount: "0.0001 BTC",
    status: "Filled",
    date: "Today",
  },
  {
    id: "2",
    symbol: "BTC",
    type: "Long market",
    amount: "0.0021 BTC",
    status: "Filled",
    date: "Today",
  },
  {
    id: "3",
    symbol: "BTC",
    type: "BTC",
    amount: "0.0001 BTC",
    status: "Canceled",
    date: "Oct 30",
  },
  {
    id: "4",
    symbol: "BTC",
    type: "BTC",
    amount: "0.0001 BTC",
    status: "Canceled",
    date: "Oct 28",
  },
];

// Dummy data for funding events
export const DUMMY_FUNDING: FundingEvent[] = [
  {
    id: "1",
    symbol: "ETH",
    action: "Received",
    amount: "+0.000234",
    isPositive: true,
    date: "Today",
  },
  {
    id: "2",
    symbol: "ETH",
    action: "Received",
    amount: "+0.001234",
    isPositive: true,
    date: "Today",
  },
  {
    id: "3",
    symbol: "ETH",
    action: "Received",
    amount: "+0.000234",
    isPositive: true,
    date: "Today",
  },
  {
    id: "4",
    symbol: "ETH",
    action: "Received",
    amount: "-0.000234",
    isPositive: false,
    date: "Today",
  },
];

interface TradeCardProps {
  trade: Trade;
}

function TradeCard({ trade }: TradeCardProps) {
  const isPositive = trade.percentChange >= 0;
  const logo = CRYPTO_LOGOS[trade.symbol];

  return (
    <div className="bg-gray-3 px-4 py-[13px] rounded-2xl flex items-center gap-2 w-full">
      {/* Token icon */}
      <div className="relative shrink-0 size-9">
        <img
          src={logo}
          alt={trade.symbol}
          className="w-full h-full rounded-full object-cover"
        />
      </div>

      {/* Token info */}
      <div className="flex-1 flex flex-col gap-3 items-start justify-center min-w-0">
        <span className="text-white font-semibold text-base tracking-tight">
          {trade.symbol}
        </span>
        <span className="text-gray-2 font-semibold text-xs tracking-tight">
          {trade.amount}
        </span>
      </div>

      {/* Percentage change */}
      <div className="flex flex-col items-end justify-center">
        <span
          className={`font-semibold text-sm tracking-tight ${
            isPositive ? "text-accent-green" : "text-accent-red"
          }`}
        >
          {isPositive ? "+" : ""}
          {formatPercentage(trade.percentChange)}
        </span>
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  const logo = CRYPTO_LOGOS[order.symbol];

  return (
    <div className="bg-gray-3 px-4 py-[13px] rounded-2xl flex items-center gap-2 w-full">
      {/* Token icon */}
      <div className="relative shrink-0 size-9">
        <img
          src={logo}
          alt={order.symbol}
          className="w-full h-full rounded-full object-cover"
        />
      </div>

      {/* Order info */}
      <div className="flex-1 flex flex-col gap-3 items-start justify-center min-w-0">
        <span className="text-white font-semibold text-base tracking-tight">
          {order.type}
        </span>
        <span className="text-gray-2 font-semibold text-xs tracking-tight">
          {order.amount}
        </span>
      </div>

      {/* Status */}
      <div className="flex flex-col items-end justify-center">
        <span className="text-gray-2 font-semibold text-sm tracking-tight">
          {order.status}
        </span>
      </div>
    </div>
  );
}

interface FundingCardProps {
  funding: FundingEvent;
}

function FundingCard({ funding }: FundingCardProps) {
  const logo = CRYPTO_LOGOS[funding.symbol];

  return (
    <div className="bg-gray-3 px-4 py-[13px] rounded-2xl flex items-center gap-2 w-full">
      {/* Token icon */}
      <div className="relative shrink-0 size-9">
        <img
          src={logo}
          alt={funding.symbol}
          className="w-full h-full rounded-full object-cover"
        />
      </div>

      {/* Funding info */}
      <div className="flex-1 flex flex-col gap-3 items-start justify-center min-w-0">
        <span className="text-white font-semibold text-base tracking-tight">
          {funding.action}
        </span>
        <span className="text-gray-2 font-semibold text-xs tracking-tight">
          {funding.symbol}
        </span>
      </div>

      {/* Amount */}
      <div className="flex flex-col items-end justify-center">
        <span
          className={`font-semibold text-sm tracking-tight ${
            funding.isPositive ? "text-accent-green" : "text-accent-red"
          }`}
        >
          {funding.amount}
        </span>
      </div>
    </div>
  );
}

// Group items by date
function groupByDate<T extends { date: string }>(items: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const existing = grouped.get(item.date);
    if (existing) {
      existing.push(item);
    } else {
      grouped.set(item.date, [item]);
    }
  }
  return grouped;
}

interface ActivityProps {
  trades?: Trade[];
  orders?: Order[];
  funding?: FundingEvent[];
  onStartTrading?: () => void;
}

export function Activity({
  trades = DUMMY_TRADES,
  orders = DUMMY_ORDERS,
  funding = DUMMY_FUNDING,
  onStartTrading,
}: ActivityProps) {
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>("trades");

  const hasActivity =
    trades.length > 0 || orders.length > 0 || funding.length > 0;

  // If no activity at all, show empty state
  if (!hasActivity) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-5">
        <ClipboardList className="w-8 h-8 text-gray-2" strokeWidth={1.5} />
        <p className="text-foreground font-semibold text-base">
          No Activity Yet
        </p>
        <p className="text-gray-1 text-sm text-center max-w-[246px]">
          Your recent trades and transactions will appear here. Start trading to
          generate your first activity record.
        </p>
        {onStartTrading && (
          <Button
            variant="secondary"
            onClick={onStartTrading}
            className="mt-4 bg-[#212121] hover:bg-[#2a2a2a] text-white rounded-2xl px-6 h-11"
          >
            Start Trading
          </Button>
        )}
      </div>
    );
  }

  const groupedTrades = groupByDate(trades);
  const groupedOrders = groupByDate(orders);
  const groupedFunding = groupByDate(funding);

  const renderContent = () => {
    if (activeFilter === "trades") {
      if (trades.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-foreground font-semibold text-base">
              No trades yet
            </p>
            <p className="text-gray-1 text-sm text-center">
              Your trade history will appear here
            </p>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-6">
          {Array.from(groupedTrades.entries()).map(([date, dateItems]) => (
            <div key={date} className="flex flex-col gap-3">
              <p className="text-foreground font-semibold text-sm tracking-tight">
                {date}
              </p>
              <div className="flex flex-col gap-2">
                {dateItems.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeFilter === "orders") {
      if (orders.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-foreground font-semibold text-base">
              No orders yet
            </p>
            <p className="text-gray-1 text-sm text-center">
              Your order history will appear here
            </p>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-6">
          {Array.from(groupedOrders.entries()).map(([date, dateItems]) => (
            <div key={date} className="flex flex-col gap-3">
              <p className="text-foreground font-semibold text-sm tracking-tight">
                {date}
              </p>
              <div className="flex flex-col gap-2">
                {dateItems.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Funding tab
    if (funding.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-foreground font-semibold text-base">
            No funding events yet
          </p>
          <p className="text-gray-1 text-sm text-center">
            Your funding history will appear here
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {Array.from(groupedFunding.entries()).map(([date, dateItems]) => (
          <div key={date} className="flex flex-col gap-3">
            <p className="text-foreground font-semibold text-sm tracking-tight">
              {date}
            </p>
            <div className="flex flex-col gap-2">
              {dateItems.map((fundingEvent) => (
                <FundingCard key={fundingEvent.id} funding={fundingEvent} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Filter label */}
      <p className="text-foreground font-semibold text-sm tracking-tight">
        Filter by
      </p>

      {/* Filter tabs */}
      <div className="bg-[#121314] h-[42px] p-[5px] rounded-xl flex gap-[5px]">
        <button
          type="button"
          onClick={() => setActiveFilter("trades")}
          className={`flex-1 h-[32px] rounded-xl flex items-center justify-center font-semibold text-sm tracking-tight transition-colors ${
            activeFilter === "trades"
              ? "bg-white text-black border border-white"
              : "bg-transparent text-gray-2 hover:text-white"
          }`}
        >
          Trades
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("orders")}
          className={`flex-1 h-[32px] rounded-xl flex items-center justify-center font-semibold text-sm tracking-tight transition-colors ${
            activeFilter === "orders"
              ? "bg-white text-black border border-white"
              : "bg-transparent text-gray-2 hover:text-white"
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("funding")}
          className={`flex-1 h-[32px] rounded-xl flex items-center justify-center font-semibold text-sm tracking-tight transition-colors ${
            activeFilter === "funding"
              ? "bg-white text-black border border-white"
              : "bg-transparent text-gray-2 hover:text-white"
          }`}
        >
          Funding
        </button>
      </div>

      {/* Content */}
      <div className="pt-3">{renderContent()}</div>
    </div>
  );
}

export default Activity;
