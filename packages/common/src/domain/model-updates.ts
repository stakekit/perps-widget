import { Market } from "./market";
import { Position } from "./portfolio";

export const updateMarketModel = (market: Market, updates: Partial<Market>) =>
  new Market({ ...market, ...updates });

export const updatePositionModel = (
  position: Position,
  updates: Partial<Position>,
) => new Position({ ...position, ...updates });

export const updateMarketMarkPrice = (market: Market, markPrice: number) =>
  updateMarketModel(market, { markPrice });

export const updatePositionMarkPrice = (
  position: Position,
  markPrice: number,
) => updatePositionModel(position, { markPrice });
