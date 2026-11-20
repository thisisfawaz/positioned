import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /messages: padded column, title + subtitle, then a list of rows. */
export default function MessagesLoading() {
  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
