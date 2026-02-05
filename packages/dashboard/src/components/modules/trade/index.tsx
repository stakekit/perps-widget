import { PositionsTable } from "../../molecules/positions";
import { Chart } from "./chart";
import { MarketInfoBar } from "./market-info";
import { OrderForm } from "./order-form";

export function TradePage() {
  return (
    <div className="flex gap-2.5 py-2.5">
      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        <MarketInfoBar />

        <Chart />

        <PositionsTable className="flex-1" />
      </div>

      <OrderForm />
    </div>
  );
}
