import { Result, useAtomValue } from "@effect-atom/atom-react";
import { marketsAtom, walletAtom } from "@yieldxyz/perps-common/atoms";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@yieldxyz/perps-common/components";
import { isWalletConnected } from "@yieldxyz/perps-common/domain";
import { cn } from "@yieldxyz/perps-common/lib";
import { OrdersTabWithWallet } from "./orders-tab";
import { PositionsTabWithWallet } from "./positions-tab";
import { TableDisconnected } from "./shared";

interface PositionsTableProps {
  className?: string;
}

export function PositionsTable({ className }: PositionsTableProps) {
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));
  const walletConnected = isWalletConnected(wallet);
  useAtomValue(marketsAtom); // TODO: investigate why this is needed

  return (
    <div
      className={cn(
        "flex flex-col bg-content-background rounded-[10px]",
        className,
      )}
    >
      <Tabs defaultValue="positions">
        {/* Tab Headers */}
        <div className="flex border-b border-background">
          <TabsList variant="line" className="py-0 h-[34px] gap-0">
            <TabsTrigger
              value="positions"
              className="px-4 py-2.5 text-xs font-normal rounded-none bg-transparent data-active:bg-transparent border-b border-transparent data-active:border-0 data-active:border-b data-active:text-white data-active:border-white text-[#707070]"
            >
              Positions
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="px-4 py-2.5 text-xs font-normal rounded-none bg-transparent data-active:bg-transparent border-b border-transparent data-active:border-0 data-active:border-b data-active:text-white data-active:border-white text-[#707070]"
            >
              Open orders
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Positions Tab */}
        <TabsContent value="positions" className="p-0">
          {walletConnected ? (
            <PositionsTabWithWallet wallet={wallet} />
          ) : (
            <TableDisconnected message="Connect your wallet to see your positions" />
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="p-0">
          {walletConnected ? (
            <OrdersTabWithWallet wallet={wallet} />
          ) : (
            <TableDisconnected message="Connect your wallet to see your orders" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
