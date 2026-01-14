import { Skeleton } from "@/components/ui/skeleton";

export function PositionDetailsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 pb-4">
          <Skeleton className="size-6" />
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-col gap-1 flex-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="pt-4">
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="pt-4">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="pt-4">
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
