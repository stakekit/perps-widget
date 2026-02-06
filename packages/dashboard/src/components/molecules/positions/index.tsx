import { Result, useAtomValue } from "@effect-atom/atom-react";
import {
  marketsAtom,
  ordersAtom,
  positionsAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@yieldxyz/perps-common/components";
import {
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import { cn } from "@yieldxyz/perps-common/lib";
import { Option, Record } from "effect";
import { OrdersTabWithWallet } from "./orders-tab";
import { PositionsTabWithWallet } from "./positions-tab";
import { TableDisconnected } from "./shared";

interface PositionsTableProps {
  className?: string;
}

const PositionsTabLabel = ({ wallet }: { wallet: WalletConnected }) => {
  const positionsResult = useAtomValue(
    positionsAtom(wallet.currentAccount.address),
  );

  return positionsResult.pipe(
    Result.value,
    Option.map((positions) => Record.size(positions)),
    Option.filter((count) => count > 0),
    Option.map((count) => `Positions (${count})`),
    Option.getOrElse(() => "Positions"),
  );
};

const OrdersTabLabel = ({ wallet }: { wallet: WalletConnected }) => {
  const ordersResult = useAtomValue(ordersAtom(wallet.currentAccount.address));

  return ordersResult.pipe(
    Result.value,
    Option.map((orders) => orders.length),
    Option.filter((orders) => orders > 0),
    Option.map((count) => `Open orders (${count})`),
    Option.getOrElse(() => "Open orders"),
  );
};

export function PositionsTable({ className }: PositionsTableProps) {
  const wallet = useAtomValue(walletAtom).pipe(Result.value, Option.getOrNull);
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
              {walletConnected ? (
                <PositionsTabLabel wallet={wallet} />
              ) : (
                "Positions"
              )}
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="px-4 py-2.5 text-xs font-normal rounded-none bg-transparent data-active:bg-transparent border-b border-transparent data-active:border-0 data-active:border-b data-active:text-white data-active:border-white text-[#707070]"
            >
              {walletConnected ? (
                <OrdersTabLabel wallet={wallet} />
              ) : (
                "Open orders"
              )}
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
