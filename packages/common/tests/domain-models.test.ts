import { Schema } from "effect";
import { describe, expect, test } from "vitest";
import {
  Action,
  ActivityItem,
  ApiEvent,
  BigIntFromString,
  Market,
  Position,
  Provider,
  TokenAddress,
  updateMarketMarkPrice,
  updatePositionMarkPrice,
} from "../src/domain";

const token = {
  symbol: "ETH",
  name: "Ethereum",
  network: "hyperliquid" as const,
  decimals: 18,
  address: "0xABCD",
  logoURI: "https://example.com/eth.png",
};

const marketDto = {
  id: "hyperliquid-eth-usdc",
  providerId: "hyperliquid",
  baseAsset: token,
  quoteAsset: {
    symbol: "USDC",
    name: "USD Coin",
    network: "arbitrum" as const,
    decimals: 6,
    address: "0xAF88D065E77C8CC2239327C5EDB3A432268E5831",
    logoURI: "https://example.com/usdc.png",
  },
  leverageRange: [1, 50],
  supportedMarginModes: ["isolated", "cross"] as const,
  markPrice: 4000,
  oraclePrice: 3998,
  priceChange24h: 12,
  priceChangePercent24h: 0.3,
  volume24h: 1000000,
  openInterest: 5000,
  makerFee: "0.0002",
  takerFee: "0.0004",
  fundingRate: "0.00012",
  fundingRateIntervalHours: 8,
  minSize: 10,
  metadata: {
    name: "ETH-USDC Perpetual",
    logoURI: "https://example.com/market.png",
    url: "https://example.com/market",
  },
};

const providerDto = {
  id: "hyperliquid",
  name: "Hyperliquid",
  network: "hyperliquid",
  metadata: {
    description: "Hyperliquid is a high-performance L1.",
    externalLink: "https://hyperliquid.xyz",
    logoURI: "https://assets.stakek.it/providers/hyperliquid.svg",
  },
  supportedActions: [
    "open",
    "close",
    "updateLeverage",
    "updateMargin",
  ] as const,
  argumentSchemas: {},
};

const pendingActionDto = {
  type: "close" as const,
  label: "Close Position",
  args: {
    marketId: "hyperliquid-eth-usdc",
    size: "1.25",
  },
};

const positionDto = {
  marketId: "hyperliquid-eth-usdc",
  side: "long" as const,
  size: "1.25",
  entryPrice: 3900,
  markPrice: 4000,
  leverage: 10,
  marginMode: "isolated" as const,
  margin: 500,
  unrealizedPnl: 125,
  funding: -1.2,
  liquidationPrice: 3500,
  pendingActions: [pendingActionDto],
};

const transactionDto = {
  id: "tx-1",
  network: "arbitrum" as const,
  chainId: "42161",
  type: "OPEN_POSITION" as const,
  status: "CREATED" as const,
  address: "0x1111111111111111111111111111111111111111",
  explorerUrls: [],
};

const actionDto = {
  id: "action-1",
  providerId: "hyperliquid",
  action: "open" as const,
  status: "CREATED" as const,
  summary: {
    type: "Open Position" as const,
    size: "1.25",
    amount: "500",
    fee: "0.0004",
  },
  transactions: [transactionDto],
  createdAt: "2026-05-11T00:00:00.000Z",
  completedAt: "2026-05-11T00:00:00.000Z",
};

const eventDto = {
  id: "event-1",
  eventType: "order_filled" as const,
  providerId: "hyperliquid",
  occurredAt: "2026-05-11T00:00:00.000Z",
  marketId: "hyperliquid-eth-usdc",
  perpActionId: "action-1",
  providerOrderId: "order-1",
  explorerUrl: "https://example.com/tx",
  order: {
    orderId: "order-1",
    marketId: "hyperliquid-eth-usdc",
    asset: "ETH",
    side: "buy" as const,
    type: "market" as const,
    originalSizeBase: "1.25",
    remainingSizeBase: "0",
    reduceOnly: false,
    isPositionLevel: false,
    clientOrderId: null,
    childOrderIds: [],
    createdAt: "2026-05-11T00:00:00.000Z",
    closedPnl: "42.5",
    fillPrice: 4010,
  },
};

describe("domain model decoding", () => {
  test("normalizes scalar and identifier values", () => {
    expect(Schema.decodeUnknownSync(TokenAddress)("0xABCD")).toBe("0xabcd");
    expect(Schema.decodeUnknownSync(BigIntFromString)("123")).toBe(123n);
  });

  test("decodes market and lowercases token addresses", () => {
    const market = Schema.decodeUnknownSync(Market)(marketDto);

    expect(market).toBeInstanceOf(Market);
    expect(market.id).toBe("hyperliquid-eth-usdc");
    expect(market.baseAsset.address).toBe("0xabcd");
    expect(market.quoteAsset.address).toBe(
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    );
  });

  test("decodes provider supported actions", () => {
    const provider = Schema.decodeUnknownSync(Provider)(providerDto);

    expect(provider).toBeInstanceOf(Provider);
    expect(provider.supportedActions).toEqual([
      "open",
      "close",
      "updateLeverage",
      "updateMargin",
    ]);
  });

  test("decodes portfolio values with string numeric fields", () => {
    const position = Schema.decodeUnknownSync(Position)(positionDto);

    expect(position).toBeInstanceOf(Position);
    expect(position.size).toBe(1.25);
    expect(position.pendingActions[0]?.args.size).toBe(1.25);
  });

  test("decodes action, API event, and activity item models", () => {
    const action = Schema.decodeUnknownSync(Action)(actionDto);
    const event = Schema.decodeUnknownSync(ApiEvent)(eventDto);
    const activity = Schema.decodeUnknownSync(ActivityItem)({
      type: "event",
      event: eventDto,
    });

    expect(action.transactions[0]?.chainId).toBe("42161");
    expect(action.summary?.size).toBe(1.25);
    expect(event.order.originalSizeBase).toBe(1.25);
    expect(activity.type).toBe("event");
  });

  test("safe update helpers preserve domain model instances", () => {
    const market = Schema.decodeUnknownSync(Market)(marketDto);
    const position = Schema.decodeUnknownSync(Position)(positionDto);

    const updatedMarket = updateMarketMarkPrice(market, 4100);
    const updatedPosition = updatePositionMarkPrice(position, 4100);

    expect(updatedMarket).toBeInstanceOf(Market);
    expect(updatedMarket.markPrice).toBe(4100);
    expect(updatedPosition).toBeInstanceOf(Position);
    expect(updatedPosition.markPrice).toBe(4100);
  });
});
