import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ToggleGroup } from "@/components/molecules/toggle-group";

const CHART_INTERVALS = [
  { value: "1", label: "1min" },
  { value: "3", label: "3min" },
  { value: "5", label: "5min" },
  { value: "15", label: "15min" },
  { value: "30", label: "30min" },
];

function createTradingViewWidget(
  container: HTMLDivElement,
  interval: string,
  onLoad: () => void,
) {
  container.innerHTML = "";

  const widgetDiv = document.createElement("div");
  widgetDiv.className = "tradingview-widget-container__widget";
  widgetDiv.style.height = "100%";
  widgetDiv.style.width = "100%";
  container.appendChild(widgetDiv);

  const script = document.createElement("script");
  script.src =
    "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
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
        "interval": "${interval}",
        "locale": "en",
        "save_image": false,
        "style": "1",
        "symbol": "NASDAQ:AAPL",
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

  // Watch for iframe to be added (indicates widget is loading)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLIFrameElement) {
          // Wait for iframe to load
          node.addEventListener(
            "load",
            () => {
              charLoadTimeout = setTimeout(onLoad, 500);
            },
            { once: true },
          );
          observer.disconnect();
          return;
        }
      }
    }
  });

  observer.observe(container, { childList: true, subtree: true });

  // Fallback timeout in case iframe load event doesn't fire
  const fallbackTimeout = setTimeout(onLoad, 3000);

  return () => {
    observer.disconnect();
    clearTimeout(fallbackTimeout);
    if (charLoadTimeout) {
      clearTimeout(charLoadTimeout);
    }
  };
}

const INITIAL_INTERVAL = CHART_INTERVALS[0].value;

function TradingViewWidget() {
  const containerARef = useRef<HTMLDivElement>(null);
  const containerBRef = useRef<HTMLDivElement>(null);

  const [chartInterval, setChartInterval] = useState(INITIAL_INTERVAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeContainer, setActiveContainer] = useState<"A" | "B">("A");

  const pendingIntervalRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Initial chart load in container A
  useEffect(() => {
    const container = containerARef.current;
    if (!container) return;

    cleanupRef.current = createTradingViewWidget(
      container,
      INITIAL_INTERVAL,
      () => {
        setIsInitialLoad(false);
      },
    );

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const handleIntervalChange = useCallback(
    (newInterval: string) => {
      if (newInterval === chartInterval) return;

      setChartInterval(newInterval);

      // Get the inactive container to load new chart
      const inactiveContainer =
        activeContainer === "A" ? containerBRef.current : containerARef.current;
      if (!inactiveContainer) return;

      setIsLoading(true);
      pendingIntervalRef.current = newInterval;

      // Clean up any previous pending load
      cleanupRef.current?.();

      // Create new chart in inactive container
      cleanupRef.current = createTradingViewWidget(
        inactiveContainer,
        newInterval,
        () => {
          if (pendingIntervalRef.current === newInterval) {
            // Swap visibility by changing active container
            setActiveContainer((prev) => (prev === "A" ? "B" : "A"));
            setIsLoading(false);
            pendingIntervalRef.current = null;
          }
        },
      );
    },
    [chartInterval, activeContainer],
  );

  return (
    <>
      <div className="w-full h-[300px] relative">
        {/* Container A */}
        <div
          className="tradingview-widget-container absolute inset-0"
          ref={containerARef}
          style={{
            height: "100%",
            width: "100%",
            visibility: activeContainer === "A" ? "visible" : "hidden",
            pointerEvents: activeContainer === "A" ? "auto" : "none",
          }}
        />

        {/* Container B */}
        <div
          className="tradingview-widget-container absolute inset-0"
          ref={containerBRef}
          style={{
            height: "100%",
            width: "100%",
            visibility: activeContainer === "B" ? "visible" : "hidden",
            pointerEvents: activeContainer === "B" ? "auto" : "none",
          }}
        />

        {/* Loading overlay */}
        {(isLoading || isInitialLoad) && (
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

export default memo(TradingViewWidget);
