import { Atom, Result } from "@effect-atom/atom-react";
import { Data, DateTime, Effect, Schema, Stream } from "effect";
import {
  CandlestickSeries,
  createChart,
  type IChartApi,
  type LogicalRange,
} from "lightweight-charts";
import type { CandleIntervalSchema } from "../../../services";
import { HyperliquidService } from "../../../services/hyperliquid";
import { managedRuntime, runtimeAtom } from "../../../services/runtime";
import { hyperliquidCandleToLwcBar } from "./candle-mapping";
import {
  CANDLE_DOWN_COLOR,
  CANDLE_UP_COLOR,
  CHART_RIGHT_BARS_PADDING,
  CHART_VARIANT_TO_VISIBLE_BARS_COUNT,
  type ChartVariant,
  DEFAULT_CHART_OPTIONS,
  HISTORY_PRELOAD_THRESHOLD,
  INITIAL_INTERVAL,
  INTERVAL_TO_START_DATA_LOOKBACK_DURATION,
} from "./constants";

export const chartContainerAtom = Atom.make<
  Result.Result<HTMLDivElement, never>
>(Result.initial(true));

export const chartIntervalAtom =
  Atom.make<typeof CandleIntervalSchema.Type>(INITIAL_INTERVAL);

const ChartDataParams = Schema.Data(
  Schema.Struct({
    symbol: Schema.String,
    variant: Schema.Literal("widget", "dashboard"),
  }),
).pipe(Schema.brand("ChartDataParams"));

export const makeChartDataParams = ({
  symbol,
  variant,
}: {
  symbol: string;
  variant: ChartVariant;
}) => Schema.decodeSync(ChartDataParams)({ symbol, variant });

export const initChartAtom = Atom.make(
  Effect.fn(function* (context) {
    const container = yield* context.result(chartContainerAtom);
    const chart = createChart(container, DEFAULT_CHART_OPTIONS);

    const series = chart.addSeries(CandlestickSeries, {
      upColor: CANDLE_UP_COLOR,
      downColor: CANDLE_DOWN_COLOR,
    });

    chart.timeScale().fitContent();

    const handleResize = () =>
      chart.applyOptions({ width: container.clientWidth });

    window.addEventListener("resize", handleResize);

    context.addFinalizer(() => {
      chart.remove();
      window.removeEventListener("resize", handleResize);
    });

    return { chart, series };
  }),
);

export const chartDataAtom = Atom.family(
  (params: typeof ChartDataParams.Type) =>
    runtimeAtom.atom(
      Effect.fn(function* (ctx) {
        const hl = yield* HyperliquidService;

        const { chart, series } = yield* ctx.result(initChartAtom);
        const timeScale = chart.timeScale();

        const interval = ctx.get(chartIntervalAtom);

        const lookBackDuration =
          INTERVAL_TO_START_DATA_LOOKBACK_DURATION[interval];

        const initialCandles = yield* hl.candleSnapshot({
          coin: params.symbol,
          interval,
          startTime: DateTime.unsafeNow().pipe(
            DateTime.subtractDuration(lookBackDuration),
            DateTime.toEpochMillis,
          ),
        });

        series.setData(initialCandles.map(hyperliquidCandleToLwcBar));

        const data = series.data();
        const visibleBarsCount =
          CHART_VARIANT_TO_VISIBLE_BARS_COUNT[params.variant];

        timeScale.setVisibleLogicalRange({
          from: Math.max(0, data.length - 1 - visibleBarsCount),
          to: data.length - 1 + CHART_RIGHT_BARS_PADDING,
        });

        const mutex = yield* Effect.makeSemaphore(1);

        let reachedHistoryStart = false;

        const onVisibleLogicalRangeChange = (range: LogicalRange | null) => {
          if (!range) {
            return;
          }

          if (!reachedHistoryStart && range.from <= HISTORY_PRELOAD_THRESHOLD) {
            loadOlderCandles({ symbol: params.symbol, interval, series }).pipe(
              Effect.tap((result) =>
                Effect.sync(() => {
                  if (result._tag === "EndReached") {
                    reachedHistoryStart = true;
                  }
                }),
              ),
              Effect.ignore,
              mutex.withPermitsIfAvailable(1),
              managedRuntime.runFork,
            );
          }
        };

        timeScale.subscribeVisibleLogicalRangeChange(
          onVisibleLogicalRangeChange,
        );

        ctx.addFinalizer(() => {
          timeScale.unsubscribeVisibleLogicalRangeChange(
            onVisibleLogicalRangeChange,
          );
        });

        yield* hl.subscribeCandle({ coin: params.symbol, interval }).pipe(
          Stream.tap((res) =>
            Effect.sync(() => series.update(hyperliquidCandleToLwcBar(res))),
          ),
          Stream.runDrain,
          Effect.forkScoped,
        );
      }),
    ),
);

type LoadOlderCandlesResult = Data.TaggedEnum<{
  Success: {};
  EndReached: {};
}>;

const LoadOlderCandlesResult = Data.taggedEnum<LoadOlderCandlesResult>();

const loadOlderCandles = Effect.fn(function* ({
  series,
  symbol,
  interval,
}: {
  symbol: string;
  interval: typeof CandleIntervalSchema.Type;
  series: ReturnType<IChartApi["addSeries"]>;
}) {
  const hl = yield* HyperliquidService;

  const lookBackDuration = INTERVAL_TO_START_DATA_LOOKBACK_DURATION[interval];

  const prevData = series.data();
  const oldestBar = prevData[0];

  if (!oldestBar) {
    return LoadOlderCandlesResult.EndReached();
  }

  const oldestBarTimeMs = Number(oldestBar.time) * 1000;

  if (oldestBarTimeMs <= 0) {
    return LoadOlderCandlesResult.EndReached();
  }

  const olderBars = yield* hl
    .candleSnapshot({
      coin: symbol,
      interval,
      startTime: DateTime.unsafeMake(oldestBarTimeMs).pipe(
        DateTime.subtractDuration(lookBackDuration),
        DateTime.toEpochMillis,
      ),
      endTime: oldestBarTimeMs - 1,
    })
    .pipe(Effect.map((result) => result.map(hyperliquidCandleToLwcBar)));

  if (olderBars.length === 0) {
    return LoadOlderCandlesResult.EndReached();
  }

  series.setData([...olderBars, ...prevData]);

  return LoadOlderCandlesResult.Success();
});
