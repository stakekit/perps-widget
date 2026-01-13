import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-white/10", className)} />
  );
}

interface AssetSkeletonProps {
  className?: string;
}

function AssetSkeleton({ className }: AssetSkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 w-full px-4 py-3 bg-white/5 rounded-2xl",
        className,
      )}
    >
      {/* Token icon skeleton */}
      <Skeleton className="shrink-0 size-9 rounded-full" />

      {/* Token info skeleton */}
      <div className="flex-1 flex flex-col gap-2.5 items-start justify-center min-w-0">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Price and change skeleton */}
      <div className="flex flex-col items-end justify-center gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export { Skeleton, AssetSkeleton };
