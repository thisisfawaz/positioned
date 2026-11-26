import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Profile skeleton - mirrors the CURRENT ProfileBody layout:
 *
 *   - no cover banner (removed from the real page)
 *   - a plain white panel, max-w-[980px], NOT a bordered rounded card
 *   - avatar on the LEFT with name/handle/bio stacked to its RIGHT
 *   - action buttons, meta row, then a tab bar
 *   - the Published tab renders a 3-column square tile grid
 *
 * Keep this in sync with ProfileBody + ProfilePosts: the old version still
 * drew a cover image and an overlapping avatar, so the page visibly morphed
 * from that shape into the real one when data arrived.
 */
export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-[980px] overflow-hidden bg-white lg:rounded-2xl">
      <div className="px-0 pb-5 pt-1 sm:px-4 lg:pt-3">
        <div className="px-3 sm:px-0">
          {/* Avatar left, name/handle/bio right. */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-24 flex-shrink-0 rounded-[1.5rem] sm:h-28 sm:w-28" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>

          {/* Action buttons. */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-xl sm:h-9 sm:w-32" />
            <Skeleton className="h-8 w-24 rounded-xl sm:h-9 sm:w-28" />
          </div>

          {/* Location / post count / availability. */}
          <div className="mt-3 flex items-center gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      </div>

      {/* Tab bar: Posts | About | Experience. */}
      <div className="flex items-center gap-5 border-b border-line px-4">
        <Skeleton className="my-3 h-4 w-12" />
        <Skeleton className="my-3 h-4 w-12" />
        <Skeleton className="my-3 h-4 w-20" />
      </div>

      {/* Published tab: 3-column square tile grid, same gaps as the real one. */}
      <ul className="grid grid-cols-3 gap-[2px] p-0 sm:gap-1 sm:p-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="block w-full aspect-square rounded-none" />
          </li>
        ))}
      </ul>
    </div>
  )
}
