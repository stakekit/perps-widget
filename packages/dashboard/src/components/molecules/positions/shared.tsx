import { Skeleton, Text } from "@yieldxyz/perps-common/components";
import { cn } from "@yieldxyz/perps-common/lib";

export const tableHeaderClass =
  "text-xs text-[#707070] font-normal tracking-tight text-left";

export const tableCellClass = "text-xs text-white font-normal tracking-tight";

export function TableDisconnected({
  message = "Connect your wallet to see your positions",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <Text className="text-sm text-white">Wallet not connected</Text>
      <Text className="text-xs text-[#707070]">{message}</Text>
    </div>
  );
}

export function OrdersTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-background">
            <th className={cn(tableHeaderClass, "py-3 pl-4 pr-2")}>Type</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Created</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Side</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Size</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Price</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Market</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Value</th>
            <th className={cn(tableHeaderClass, "py-3 pl-2 pr-4")}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i} className="border-b border-background last:border-b-0">
              <td className="py-3 pl-4 pr-2">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="py-3 pl-2 pr-4">
                <Skeleton className="h-4 w-12" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PositionsTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-background">
            <th className={cn(tableHeaderClass, "py-3 pl-4 pr-2")}>Coin</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Size</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>
              Position value
            </th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Entry Price</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Mark Price</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>PNL (ROE %)</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Liq. Price</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Margin</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Close</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>TP</th>
            <th className={cn(tableHeaderClass, "py-3 pl-2 pr-4")}>SL</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i} className="border-b border-background last:border-b-0">
              <td className="py-3 pl-4 pr-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="py-3 pl-2 pr-4">
                <Skeleton className="h-4 w-12" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
