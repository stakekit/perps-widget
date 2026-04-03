import { Skeleton } from "@yieldxyz/perps-common/components";

export function AdjustMarginLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 pb-4">
        <Skeleton className="size-6" />
        <Skeleton className="size-9 rounded-full" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 pt-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-12 w-36" />
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>

      <Skeleton className="h-12 w-full rounded-[10px]" />
    </div>
  );
}
