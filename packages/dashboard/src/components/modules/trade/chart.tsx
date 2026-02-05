import {
  type AtomRef,
  Result,
  useAtomRef,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Chart as ChartView, Text } from "@yieldxyz/perps-common/components";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { TriangleAlertIcon } from "lucide-react";
import { selectedMarketAtom } from "../../../atoms/selected-market-atom";

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

const ChartContent = ({
  marketRef,
}: {
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
}) => {
  const market = useAtomRef(marketRef);

  return <ChartView symbol={market.baseAsset.symbol} variant="dashboard" />;
};

export const Chart = () => {
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
