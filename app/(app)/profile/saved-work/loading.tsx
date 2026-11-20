import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /profile/saved-work: title + subtitle, then the masonry grid. */
export default function SavedWorkLoading() {
  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const tall = i % 5 === 0 || i % 7 === 0
          return (
            <div key={i} className="mb-3 break-inside-avoid overflow-hidden rounded-xl">
              <Skeleton className={`w-full rounded-xl ${tall ? 'aspect-[3/4]' : 'aspect-square'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
