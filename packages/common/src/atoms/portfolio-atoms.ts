import {
  Array as _Array,
  Duration,
  Effect,
  Option,
  Record,
  Schema,
} from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as AtomRef from "effect/unstable/reactivity/AtomRef";
import { WalletAccountAddress } from "../domain";
import type { WalletAccount } from "../domain/wallet";
import { ApiClientService } from "../services/api-client";
import { runtimeAtom, withReactivity } from "../services/runtime";
import { midPriceAtom } from "./hyperliquid-atoms";
import { marketsBySymbolAtom } from "./markets-atoms";
import { providersAtom, selectedProviderAtom } from "./providers-atoms";

export const portfolioReactivityKeys = {
  positions: "positions",
  orders: "orders",
  providersBalances: "providersBalances",
  selectedProviderBalances: "selectedProviderBalances",
} as const;

export const portfolioReactivityKeysArray = Object.values(
  portfolioReactivityKeys,
);

export const positionsAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom
      .atom(
        Effect.fn(function* (ctx) {
          const client = yield* ApiClientService;
          const selectedProvider = yield* ctx.result(selectedProviderAtom);

          const positions = yield* client.PortfolioControllerGetPositions({
            payload: {
              address: walletAddress,
              providerId: selectedProvider.id,
            },
          });

          return Record.fromIterableBy(
            positions.map((position) => AtomRef.make(position)),
            (ref) => ref.value.marketId,
          );
        }),
      )
      .pipe(
        withReactivity([portfolioReactivityKeys.positions]),
        Atom.withRefresh(Duration.minutes(1)),
        Atom.keepAlive,
      ),
);

export const ordersAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom
      .atom(
        Effect.fn(function* (ctx) {
          const client = yield* ApiClientService;
          const selectedProvider = yield* ctx.result(selectedProviderAtom);

          return yield* client.PortfolioControllerGetOrders({
            payload: {
              address: walletAddress,
              providerId: selectedProvider.id,
            },
          });
        }),
      )
      .pipe(
        withReactivity([portfolioReactivityKeys.orders]),
        Atom.withRefresh(Duration.minutes(1)),
        Atom.keepAlive,
      ),
);

export const providersBalancesAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom
      .atom(
        Effect.fnUntraced(function* (get) {
          const providers = yield* get.result(providersAtom);
          const client = yield* ApiClientService;

          return yield* Effect.all(
            providers.map((provider) =>
              client
                .PortfolioControllerGetBalances({
                  payload: {
                    address: walletAddress,
                    providerId: provider.id,
                  },
                })
                .pipe(Effect.option),
            ),
            { concurrency: "unbounded" },
          ).pipe(Effect.map(_Array.getSomes));
        }),
      )
      .pipe(
        withReactivity([portfolioReactivityKeys.providersBalances]),
        Atom.withRefresh(Duration.minutes(1)),
        Atom.keepAlive,
      ),
);

export const selectedProviderBalancesAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom
      .atom(
        Effect.fn(function* (ctx) {
          const selectedProvider = yield* ctx.result(selectedProviderAtom);
          const client = yield* ApiClientService;

          return yield* client.PortfolioControllerGetBalances({
            payload: {
              address: walletAddress,
              providerId: selectedProvider.id,
            },
          });
        }),
      )
      .pipe(
        withReactivity([portfolioReactivityKeys.selectedProviderBalances]),
        Atom.withRefresh(Duration.minutes(1)),
        Atom.keepAlive,
      ),
);

/**
 * markPrice becomes live, while unrealizedPnl, liquidationPrice, and the other server-derived fields stay stale
 * TODO: handle this in the future
 */
export const updatePositionsMidPriceAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom.atom((ctx) =>
      Effect.gen(function* () {
        const { mids } = yield* ctx.result(midPriceAtom);
        const markets = yield* ctx.result(marketsBySymbolAtom);
        const positions = yield* ctx.result(positionsAtom(walletAddress));

        Record.toEntries(mids).forEach(([symbol, price]) => {
          const marketRef = Record.get(markets, symbol);
          if (marketRef._tag === "None") return;

          const positionRef = Record.get(positions, marketRef.value.value.id);
          if (positionRef._tag === "None") return;

          positionRef.value.update((position) => ({
            ...position,
            markPrice: Number(price),
          }));
        });
      }),
    ),
);

export const GetCurrentPositionRefArgs = Schema.Struct({
  marketId: Schema.String,
  address: WalletAccountAddress,
}).pipe(Schema.brand("GetCurrentPositionRefArgs"));

export const makeGetCurrentPositionRefArgs = Schema.decodeSync(
  GetCurrentPositionRefArgs,
);

export const currentPositionRefAtom = Atom.family(
  ({ marketId, address }: typeof GetCurrentPositionRefArgs.Type) =>
    Atom.make((ctx) => {
      const positionsResult = ctx.get(positionsAtom(address));

      if (positionsResult._tag !== "Success") return null;

      const positionRef = Record.get(positionsResult.value, marketId);

      return positionRef.pipe(Option.getOrNull);
    }),
);
