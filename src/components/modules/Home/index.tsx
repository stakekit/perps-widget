import { Link } from "@tanstack/react-router";
import {
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  PanelsRightBottom,
  Repeat2,
} from "lucide-react";
import { useState } from "react";
import hyperliquid from "@/assets/hyperliquid.png";
import { AssetList } from "@/components/modules/Home/AssetList";
import { Activity } from "@/components/modules/Home/activity";
import { Positions } from "@/components/modules/Home/positions";
import { AccountValueDisplay } from "@/components/molecules/account-value-display";
import { AddressSwitcher } from "@/components/molecules/address-switcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Home = () => {
  const [activeTab, setActiveTab] = useState("trade");

  return (
    <div className="flex flex-col gap-3 justify-center">
      {/* Address Switcher */}
      <div className="flex justify-center">
        <AddressSwitcher />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="font-semibold text-xl text-foreground">Perps</p>
        <img src={hyperliquid} className="w-8 h-8 rounded-full" alt="avatar" />
      </div>

      {/* Account value */}
      <Link to="/account">
        <div className="rounded-2xl p-4 flex justify-between items-center bg-gray-5 group">
          <AccountValueDisplay />

          <div className="text-white font-semibold text-base tracking-tight items-center justify-center group-hover:flex hidden">
            <ChevronRight className="size-6" />
          </div>
        </div>
      </Link>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="trade">
            {activeTab === "trade" ? (
              <span className="font-semibold text-sm tracking-tight">
                Trade
              </span>
            ) : (
              <Repeat2 className="w-3.5 h-3.5" />
            )}
          </TabsTrigger>
          <TabsTrigger value="positions">
            {activeTab === "positions" ? (
              <span className="font-semibold text-sm tracking-tight">
                Positions
              </span>
            ) : (
              <ChartNoAxesColumnIncreasing className="w-3.5 h-3.5" />
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">
            {activeTab === "activity" ? (
              <span className="font-semibold text-sm tracking-tight">
                Activity
              </span>
            ) : (
              <PanelsRightBottom className="w-3.5 h-3.5" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="mt-4">
          <AssetList />
        </TabsContent>

        <TabsContent value="positions" className="mt-4">
          <Positions />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Activity onStartTrading={() => setActiveTab("trade")} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
