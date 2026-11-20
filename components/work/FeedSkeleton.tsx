import { Skeleton } from '@/components/ui/Skeleton'

export function FeedSkeleton() {
  return (
    <div className="relative lg:static" style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
      <div className="hidden h-full w-full items-center justify-center lg:flex">
        <div className="relative h-full aspect-[9/16] overflow-hidden rounded-xl bg-surface-sunken">
          <Skeleton className="absolute left-4 top-4 h-11 w-11 rounded-xl" />
          <Skeleton className="absolute left-20 top-4 h-3.5 w-40" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-3 h-9 w-36 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="flex h-full w-full flex-col justify-between p-4 lg:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="mt-3 h-9 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
