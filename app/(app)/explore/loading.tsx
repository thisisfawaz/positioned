import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Explore route skeleton - a SHAPE-FOR-SHAPE mirror of the real page:
 *
 *   header row  : "Explore" title + subtitle on the left, a Filters button
 *                 (with icon) pinned right
 *   search row  : one full-width rounded search field
 *   grid        : the SAME masonry as PostTileGrid - columns-2 / sm:columns-3 /
 *                 lg:columns-4, gap-3, each tile mb-3 break-inside-avoid
 *                 rounded-xl, and the SAME tall rhythm (i % 5 === 0 ||
 *                 i % 7 === 0 -> aspect-[3/4], else aspect-square).
 *
 * Each tile also carries a faint bottom strip standing in for the real
 * gradient overlay (author name + title), so the skeleton reads as "posts",
 * not floating grey blocks. When the real tiles land, nothing shifts.
 */
export default function ExploreLoading() {
  return (
    <div className="w-full pb-6">
      {/* Header: title + subtitle left, Filters button right. */}
      <div className="px-3 pt-2 sm:px-4 lg:pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Skeleton className="h-[26px] w-28" />
            <Skeleton className="mt-2 h-[14px] w-64 max-w-full" />
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5 py-2">
            <Skeleton className="h-[17px] w-[17px] rounded-md" />
            <Skeleton className="h-[13px] w-12" />
          </div>
        </div>

        {/* Search field. */}
        <Skeleton className="mt-4 h-[46px] w-full rounded-xl" />
      </div>

      {/* Masonry grid - identical container + tall rhythm to PostTileGrid. */}
      <div className="mt-4 px-3 sm:px-4">
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {Array.from({ length: 12 }).map((_, i) => {
            const tall = i % 5 === 0 || i % 7 === 0
            return (
              <div
                key={i}
                className="relative mb-3 break-inside-avoid overflow-hidden rounded-xl"
              >
                <Skeleton
                  className={`w-full rounded-xl ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}
                />
                {/* Bottom overlay stand-in: name line + title line. */}
                <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-2.5">
                  <Skeleton className="h-[11px] w-2/3 rounded" />
                  <Skeleton className="h-[9px] w-1/2 rounded" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
