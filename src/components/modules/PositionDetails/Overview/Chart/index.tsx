import { useAtomValue } from "@effect-atom/atom-react";
import { Option } from "effect";
import { useLayoutEffect, useRef, useState } from "react";
import {
  CHART_INTERVALS,
  INITIAL_INTERVAL,
  tradingViewSymbolAtom,
} from "@/components/modules/PositionDetails/Overview/Chart/state";
import { ToggleGroup } from "@/components/molecules/toggle-group";
import { TRADING_VIEW_WIDGET_SCRIPT_URL } from "@/services/constants";

function createTradingViewWidget({
  container,
  onIframeReady,
  providerId,
  tradingViewSymbol,
}: {
  container: HTMLDivElement;
  providerId: string;
  tradingViewSymbol: string;
  onIframeReady: (iframe: HTMLIFrameElement) => void;
}) {
  container.innerHTML = "";

  const widgetDiv = document.createElement("div");
  widgetDiv.className = "tradingview-widget-container__widget";
  widgetDiv.style.height = "100%";
  widgetDiv.style.width = "100%";
  container.appendChild(widgetDiv);

  const script = document.createElement("script");
  script.src = TRADING_VIEW_WIDGET_SCRIPT_URL;
  script.type = "text/javascript";
  script.async = true;
  script.innerHTML = `
    {
        "allow_symbol_change": false,
        "calendar": false,
        "details": false,
        "hide_side_toolbar": true,
        "hide_top_toolbar": true,
        "hide_legend": true,
        "hide_volume": true,
        "hotlist": true,
        "interval": "${INITIAL_INTERVAL}",
        "locale": "en",
        "save_image": false,
        "style": "1",
        "symbol": "${providerId}:${tradingViewSymbol}",
        "theme": "dark",
        "timezone": "exchange",
        "backgroundColor": "rgba(0, 0, 0, 1)",
        "gridColor": "rgba(74, 74, 74, 0.51)",
        "watchlist": [],
        "withdateranges": false,
        "compareSymbols": [],
        "studies": [],
        "autosize": true
      }`;
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

export function Chart({ symbol }: { symbol: string }) {
  const { providerId, tradingViewSymbol } = useAtomValue(
    tradingViewSymbolAtom(symbol),
  ).pipe(
    Option.map((v) => ({
      providerId: v.providerId,
      tradingViewSymbol: v.tradingViewSymbol,
    })),
    Option.getOrElse(() => ({
      providerId: "COINBASE",
      tradingViewSymbol: `${symbol}USD`,
    })),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [chartInterval, setChartInterval] = useState(INITIAL_INTERVAL);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return createTradingViewWidget({
      container,
      providerId,
      tradingViewSymbol,
      onIframeReady: (iframe) => {
        setIsLoading(false);
        iframeRef.current = iframe;
      },
    });
  }, [providerId, tradingViewSymbol]);

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
      <div className="w-full h-[300px] relative">
        <div
          className="tradingview-widget-container absolute inset-0"
          ref={containerRef}
          style={{ height: "100%", width: "100%" }}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-200">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-white/70 text-sm">Loading chart...</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center pt-4 pb-5">
        <ToggleGroup
          options={CHART_INTERVALS}
          value={chartInterval}
          onValueChange={handleIntervalChange}
          variant="compact"
          className="w-[320px]"
        />
      </div>
    </>
  );
}
