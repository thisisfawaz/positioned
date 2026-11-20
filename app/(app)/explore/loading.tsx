import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Explore route skeleton - matches the page header (title, subtitle, search,
 * chips) plus the masonry grid. Shown the instant /explore opens.
 */
export default function ExploreLoading() {
  return (
    <div className="w-full pb-6">
      <div className="px-3 pt-2 sm:px-4 lg:pt-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
        <Skeleton className="mt-4 h-11 w-full rounded-xl" />
        <div className="mt-3 flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-20 flex-shrink-0 rounded-full" />
          ))}
        </div>
      </div>
      <div className="mt-4 px-3 sm:px-4">
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const tall = i % 5 === 0 || i % 7 === 0
            return (
              <div key={i} className="mb-3 break-inside-avoid overflow-hidden rounded-xl">
                <Skeleton
                  className={`w-full rounded-xl ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
