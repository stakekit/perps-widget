import { SLIDER_STOPS } from "@/components/modules/Order/Overview/state";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 pb-4">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-col gap-1 flex-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-20 rounded-[11px]" />
        </div>
        <div className="flex-1 flex flex-col pt-6">
          <div className="flex flex-col items-center gap-0 pt-6">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-5 w-24 mt-4" />
          </div>
          <div className="flex flex-col gap-2.5 pt-9">
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              {SLIDER_STOPS.map((stop) => (
                <Skeleton key={stop} className="h-4 w-8" />
              ))}
            </div>
          </div>
          <div className="pt-9">
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <div className="flex flex-col pt-6">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
      <Skeleton className="w-full h-14 rounded-[10px]" />
    </div>
  );
}
