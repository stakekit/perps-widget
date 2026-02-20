import {
  Result,
  useAtom,
  useAtomMount,
  useAtomValue,
} from "@effect-atom/atom-react";
import { cn } from "../../../lib";
import type { CandleIntervalSchema } from "../../../services";
import { Text } from "../../ui/text";
import { ToggleGroup } from "../toggle-group";
import { CHART_INTERVALS, type ChartVariant } from "./constants";
import {
  chartContainerAtom,
  chartDataAtom,
  chartIntervalAtom,
  initChartAtom,
  makeChartDataParams,
} from "./state";

export const Chart = ({
  symbol,
  variant,
}: {
  variant: ChartVariant;
  symbol: string;
}) => {
  useAtomMount(initChartAtom);
  const [containerResult, setContainer] = useAtom(chartContainerAtom);
  const chartData = useAtomValue(
    chartDataAtom(makeChartDataParams({ symbol, variant })),
  );
  const [interval, setInterval] = useAtom(chartIntervalAtom);

  const toggleGroup = (
    <ToggleGroup
      options={[...CHART_INTERVALS]}
      value={interval}
      onValueChange={(newInterval) =>
        setInterval(newInterval as typeof CandleIntervalSchema.Type)
      }
      variant="compact"
      className={
        variant === "dashboard"
          ? "absolute top-3 right-3 z-20 rounded-xl bg-black/60 p-1 backdrop-blur-sm"
          : "flex items-center justify-center pt-4 pb-5"
      }
    />
  );

  const isLoading =
    Result.isWaiting(chartData) || Result.isWaiting(containerResult);

  return (
    <>
      <div
        className={cn(
          "w-full relative",
          variant === "dashboard" ? "h-[450px]" : "h-[300px]",
          "rounded-[10px] overflow-hidden relative",
        )}
      >
        {variant === "dashboard" && toggleGroup}

        <div
          ref={(el) => {
            if (!el) return;
            setContainer(Result.success(el));
          }}
          className="absolute w-full h-full"
        />

        {isLoading && (
          <div className="absolute inset-0 bg-black backdrop-blur-sm justify-center z-10 transition-opacity duration-200 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <Text as="span" variant="inherit" className="text-white/70 text-sm">
              Loading chart...
            </Text>
          </div>
        )}
      </div>

      {variant === "widget" && toggleGroup}
    </>
  );
};
