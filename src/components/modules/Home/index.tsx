import { Link } from "@tanstack/react-router";
import {
  ChartNoAxesColumnIncreasing,
  PanelsRightBottom,
  Repeat2,
} from "lucide-react";
import { useState } from "react";
import dummy from "@/assets/dummy.png";
import { Activity } from "@/components/modules/Home/activity";
import { AssetList } from "@/components/modules/Home/asset-list";
import { Positions } from "@/components/modules/Home/positions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Home = () => {
  const [activeTab, setActiveTab] = useState("trade");

  return (
    <div className="flex flex-col gap-3 justify-center">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="font-semibold text-xl text-foreground">Perps</p>
        <img src={dummy} className="w-8 h-8 rounded-full" alt="avatar" />
      </div>

      {/* Account value */}
      <div className="rounded-2xl p-4 flex justify-between items-center bg-gray-5">
        <div className="flex items-center gap-2">
          <img
            src="https://assets.stakek.it/tokens/usdc_160x160.png"
            alt="usdc"
            className="w-9 h-9"
          />
          <div className="flex flex-col gap-2 items-start justify-center">
            <p className="text-gray-2 font-semibold text-sm leading-tight tracking-tight">
              Account value
            </p>
            <p className="text-foreground text-lg font-semibold leading-tight tracking-tight">
              $0.00
            </p>
          </div>
        </div>

        <Link
          to="/account"
          className="bg-background h-9 px-3.5 rounded-full text-white font-semibold text-base tracking-tight hover:bg-background/80 transition-colors flex items-center justify-center"
        >
          Deposit
        </Link>
      </div>

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
          <AssetList maxHeight={350} />
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
