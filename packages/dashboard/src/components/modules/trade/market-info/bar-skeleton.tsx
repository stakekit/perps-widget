import { Skeleton } from "@yieldxyz/perps-common/components";
import { cn } from "@yieldxyz/perps-common/lib";

export function MarketInfoBarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-6 px-4 py-3 bg-content-background rounded-[10px]",
        className,
      )}
    >
      {/* Asset Selector Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-4 w-10 rounded" />
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-white/10" />

      {/* Price Skeleton */}
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* 24H Change Skeleton */}
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* 24H Volume Skeleton */}
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Open Interest Skeleton */}
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Maker Fee Skeleton */}
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Taker Fee Skeleton */}
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}
