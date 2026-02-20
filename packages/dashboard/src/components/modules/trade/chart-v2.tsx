import {
  type AtomRef,
  Result,
  useAtomRef,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Text } from "@yieldxyz/perps-common/components";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { TriangleAlertIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { selectedMarketAtom } from "../../../atoms/selected-market-atom";

// ---------------------------------------------------------------------------
// TradingView Charting Library path (static files must be served from here)
// ---------------------------------------------------------------------------
const LIBRARY_PATH = "/charting_library/";

// ---------------------------------------------------------------------------
// Stub datafeed – satisfies IBasicDataFeed without providing real data.
// Replace with a real implementation when connecting a data source.
// ---------------------------------------------------------------------------
const SUPPORTED_RESOLUTIONS = [
  "1",
  "5",
  "15",
  "30",
  "60",
  "240",
  "1D",
  "1W",
] as const;

function createStubDatafeed() {
  return {
    onReady: (callback: (config: Record<string, unknown>) => void) => {
      setTimeout(() =>
        callback({
          supported_resolutions: SUPPORTED_RESOLUTIONS,
          supports_marks: false,
          supports_timescale_marks: false,
          supports_time: true,
        }),
      );
    },

    searchSymbols: (
      _userInput: string,
      _exchange: string,
      _symbolType: string,
      onResult: (result: never[]) => void,
    ) => {
      onResult([]);
    },

    resolveSymbol: (
      symbolName: string,
      onResolve: (symbolInfo: Record<string, unknown>) => void,
      _onError: (reason: string) => void,
    ) => {
      const symbolInfo = {
        ticker: symbolName,
        name: symbolName,
        description: symbolName,
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: "",
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        has_weekly_and_monthly: true,
        visible_plots_set: "ohlcv",
        supported_resolutions: SUPPORTED_RESOLUTIONS,
        volume_precision: 2,
        data_status: "streaming",
      };

      setTimeout(() => onResolve(symbolInfo));
    },

    getBars: (
      _symbolInfo: unknown,
      _resolution: string,
      _periodParams: unknown,
      onResult: (bars: never[], meta: { noData: boolean }) => void,
      _onError: (reason: string) => void,
    ) => {
      // No data – the chart will show an empty state
      onResult([], { noData: true });
    },

    subscribeBars: () => {
      // no-op – real-time updates not wired yet
    },

    unsubscribeBars: () => {
      // no-op
    },
  };
}

// ---------------------------------------------------------------------------
// Widget creation helper
// ---------------------------------------------------------------------------

// biome-ignore lint/suspicious/noExplicitAny: TradingView global types are not available
type TradingViewWidget = any;

function createChartWidget(
  container: HTMLElement,
  symbol: string,
): TradingViewWidget | null {
  // biome-ignore lint/suspicious/noExplicitAny: TradingView global
  const TV = (window as any).TradingView;
  if (!TV?.widget) return null;

  return new TV.widget({
    // ---- core ----
    container,
    symbol,
    datafeed: createStubDatafeed(),
    library_path: LIBRARY_PATH,
    interval: "15",
    locale: "en",
    timezone: "exchange",

    // ---- sizing ----
    autosize: true,

    // ---- theme ----
    theme: "dark",
    toolbar_bg: "#000000",
    loading_screen: {
      backgroundColor: "#000000",
      foregroundColor: "#787b86",
    },

    // ---- features ----
    disabled_features: [
      "header_symbol_search",
      "header_compare",
      "header_screenshot",
      "header_saveload",
      "header_undo_redo",
      "header_fullscreen_button",
      "symbol_search_hot_key",
      "display_market_status",
      "use_localstorage_for_settings",
      "save_chart_properties_to_local_storage",
      "go_to_date",
      "timeframes_toolbar",
      "volume_force_overlay",
      "create_volume_indicator_by_default",
    ],
    enabled_features: [
      "hide_left_toolbar_by_default",
      "move_logo_to_main_pane",
    ],

    // ---- misc ----
    favorites: {
      intervals: ["15", "60", "240", "1D"],
    },
    save_image: false,
    allow_symbol_change: false,
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const ChartLoading = () => (
  <div className="h-[450px] w-full bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <Text as="span" variant="inherit" className="text-white/70 text-sm">
        Loading chart...
      </Text>
    </div>
  </div>
);

const ChartError = ({ message }: { message: string }) => (
  <div className="p-1 bg-content-background rounded-[10px]">
    <div className="h-[450px] w-full flex items-center justify-center">
      <div className="flex items-center gap-2 text-white/70">
        <TriangleAlertIcon className="size-5" />
        <span>{message}</span>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Chart content – creates the TradingView Charting Library widget
// ---------------------------------------------------------------------------

const ChartContent = ({
  marketRef,
}: {
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
}) => {
  const market = useAtomRef(marketRef);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<TradingViewWidget | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const symbol = market.baseAsset.symbol;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up a previous widget instance
    if (widgetRef.current) {
      widgetRef.current.remove?.();
      widgetRef.current = null;
    }

    setIsLoading(true);

    const widget = createChartWidget(container, symbol);
    widgetRef.current = widget;

    if (widget) {
      widget.onChartReady?.(() => {
        setIsLoading(false);
      });
    } else {
      // TradingView library not loaded yet – keep loading state
      setIsLoading(false);
    }

    return () => {
      widget?.remove?.();
      widgetRef.current = null;
    };
  }, [symbol]);

  return (
    <div className="w-full relative h-[450px]">
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ height: "100%", width: "100%" }}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10 transition-opacity duration-200">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <Text as="span" variant="inherit" className="text-white/70 text-sm">
              Loading chart...
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------

export const ChartV2 = () => {
  const selectedMarketResult = useAtomValue(selectedMarketAtom);

  return (
    <div className="p-1 bg-content-background rounded-[10px]">
      {Result.matchWithWaiting(selectedMarketResult, {
        onWaiting: () => <ChartLoading />,
        onSuccess: ({ value: selectedMarket }) => (
          <ChartContent marketRef={selectedMarket} />
        ),
        onError: () => <ChartError message="Failed to load market data" />,
        onDefect: () => <ChartError message="An unexpected error occurred" />,
      })}
    </div>
  );
};
