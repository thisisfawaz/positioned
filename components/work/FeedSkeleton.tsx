/**
 * Full-screen reel skeleton - a SHAPE mirror of a ReelFeed card: avatar +
 * name top-left, caption + action button bottom-left, on the one-card-per-screen
 * frame. Blocks use `.skeleton-shimmer` (theme-aware sweep) so the feed reads
 * as loading the same way Explore's grid does.
 */
export function FeedSkeleton() {
  return (
    <div className="relative lg:static" style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
      {/* Desktop: one centred 9/16 reel card. */}
      <div className="hidden h-full w-full items-center justify-center lg:flex">
        <div className="relative h-full aspect-[9/16] overflow-hidden rounded-xl">
          <div className="absolute left-4 top-4 h-11 w-11 rounded-xl skeleton-shimmer" />
          <div className="absolute left-20 top-4 h-3.5 w-40 skeleton-shimmer" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
            <div className="h-4 w-3/4 skeleton-shimmer" />
            <div className="h-3 w-1/2 skeleton-shimmer" />
            <div className="mt-3 h-9 w-36 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* Mobile: full-bleed reel, same top/bottom overlay positions. */}
      <div className="flex h-full w-full flex-col justify-between p-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-3.5 w-40 skeleton-shimmer" />
            <div className="h-3 w-24 skeleton-shimmer" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-3/4 skeleton-shimmer" />
          <div className="h-3 w-1/2 skeleton-shimmer" />
          <div className="mt-3 h-9 w-36 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}
