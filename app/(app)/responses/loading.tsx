import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Mirrors /responses: padded column, title + subtitle, then one card per post
 * (thumbnail + title + "N responses").
 */
export default function ResponsesLoading() {
  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl bg-surface py-3 pl-[5px] pr-3">
            <Skeleton className="h-14 w-14 flex-shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
