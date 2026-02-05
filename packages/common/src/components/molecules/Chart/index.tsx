import { useAtomValue } from "@effect-atom/atom-react";
import { Option } from "effect";
import { TriangleAlertIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../../lib";
import { TRADING_VIEW_WIDGET_SCRIPT_URL } from "../../../services";
import { Text } from "../../ui/text";
import { ToggleGroup } from "../toggle-group";
import {
  CHART_INTERVALS,
  INITIAL_INTERVAL,
  tradingViewSymbolAtom,
} from "./state";

export type ChartVariant = "widget" | "dashboard";

export function createTradingViewWidget({
  container,
  onIframeReady,
  providerId,
  tradingViewSymbol,
  variant,
}: {
  variant: ChartVariant;
  container: HTMLDivElement;
  providerId: string;
  tradingViewSymbol: string;
  onIframeReady: (iframe: HTMLIFrameElement) => void;
}) {
  container.innerHTML = "";

  const widgetConfig = {
    allow_symbol_change: false,
    calendar: false,
    details: false,
    hide_side_toolbar: true,
    hide_top_toolbar: true,
    hide_legend: true,
    hide_volume: true,
    hotlist: false,
    interval: INITIAL_INTERVAL,
    locale: "en",
    save_image: false,
    style: "1",
    symbol: `${providerId}:${tradingViewSymbol}`,
    theme: "dark",
    timezone: "exchange",
    backgroundColor: "rgba(0, 0, 0, 1)",
    gridColor: "rgba(74, 74, 74, 0.51)",
    watchlist: [],
    withdateranges: false,
    compareSymbols: [],
    studies: [],
    autosize: true,
    overrides: {
      "paneProperties.vertGridProperties.color": "#363c4e",
      "mainSeriesProperties.candleStyle.upColor": "#26a69a",
      "mainSeriesProperties.candleStyle.downColor": "#ef5350",
      // Add these to hide/change border colors:
      "paneProperties.separatorColor": "#000000", // transparent (for volume pane separator),
      "scalesProperties.lineColor": "transparent",
      "scalesProperties.textColor": "#9598a1", // axis text color
      "paneProperties.backgroundType": "solid",
      "paneProperties.background": "#000000",
    },
  };

  const config =
    variant === "widget"
      ? JSON.stringify(widgetConfig)
      : JSON.stringify({
          ...widgetConfig,
          hide_side_toolbar: false,
          hide_top_toolbar: false,
          hide_legend: false,
          hide_volume: false,
        });

  const widgetDiv = document.createElement("div");
  widgetDiv.className = "tradingview-widget-container__widget";
  widgetDiv.style.height = "100%";
  widgetDiv.style.width = "100%";
  container.appendChild(widgetDiv);

  const script = document.createElement("script");
  script.src = TRADING_VIEW_WIDGET_SCRIPT_URL;
  script.type = "text/javascript";
  script.async = true;
  script.innerHTML = config;
  container.appendChild(script);

  let charLoadTimeout: NodeJS.Timeout | null = null;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLIFrameElement) {
          node.addEventListener(
            "load",
            () => {
              charLoadTimeout = setTimeout(() => {
                onIframeReady(node);
              }, 500);
            },
            { once: true },
          );
          observer.disconnect();
        }
      }
    }
  });

  observer.observe(container, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    if (charLoadTimeout) {
      clearTimeout(charLoadTimeout);
    }
  };
}

function ChartAvailable({
  providerId,
  tradingViewSymbol,
  variant,
}: {
  variant: ChartVariant;
  providerId: string;
  tradingViewSymbol: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [chartInterval, setChartInterval] = useState(INITIAL_INTERVAL);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    setIsLoading(true);
    const container = containerRef.current;
    if (!container) return;

    return createTradingViewWidget({
      container,
      variant,
      providerId,
      tradingViewSymbol,
      onIframeReady: (iframe) => {
        setIsLoading(false);
        iframeRef.current = iframe;
      },
    });
  }, [providerId, tradingViewSymbol, variant]);

  const handleIntervalChange = (newInterval: string) => {
    if (newInterval === chartInterval || !iframeRef.current?.contentWindow) {
      return;
    }

    setChartInterval(newInterval);
    iframeRef.current.contentWindow.postMessage(
      { name: "set-interval", data: { interval: newInterval } },
      "*",
    );
  };

  return (
    <>
      <div
        className={cn(
          "w-full relative",
          variant === "dashboard" ? "h-[450px]" : "h-[300px]",
        )}
      >
        <div
          className="tradingview-widget-container absolute inset-0"
          ref={containerRef}
          style={{
            height: "100%",
            width: "100%",
            margin: "-1px",
            clipPath: "inset(1.5px)",
          }}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-200">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <Text
                as="span"
                variant="inherit"
                className="text-white/70 text-sm"
              >
                Loading chart...
              </Text>
            </div>
          </div>
        )}
      </div>

      {variant === "widget" && (
        <div className="flex items-center justify-center pt-4 pb-5">
          <ToggleGroup
            options={CHART_INTERVALS}
            value={chartInterval}
            onValueChange={handleIntervalChange}
            variant="compact"
            className="w-[320px]"
          />
        </div>
      )}
    </>
  );
}

const ChartNotAvailable = ({ variant }: { variant: ChartVariant }) => {
  return (
    <div
      className={cn(
        "w-full bg-black backdrop-blur-sm flex items-center justify-center",
        variant === "dashboard" ? "h-[450px]" : "h-[300px]",
      )}
    >
      <div className="flex items-center gap-2 text-lg">
        <TriangleAlertIcon className="text-white/70" />
        <Text as="span" variant="inherit" className="text-white/70">
          Chart not available
        </Text>
      </div>
    </div>
  );
};

export const Chart = ({
  symbol,
  variant,
}: {
  symbol: string;
  variant: "widget" | "dashboard";
}) => {
  const chartMeta = useAtomValue(tradingViewSymbolAtom(symbol)).pipe(
    Option.map((v) => ({
      providerId: v.providerId,
      tradingViewSymbol: v.tradingViewSymbol,
    })),
    Option.getOrNull,
  );

  return chartMeta ? (
    <ChartAvailable {...chartMeta} variant={variant} />
  ) : (
    <ChartNotAvailable variant={variant} />
  );
};
