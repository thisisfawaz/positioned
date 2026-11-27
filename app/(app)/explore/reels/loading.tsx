/** Full-screen reel skeleton - SHAPE mirror of a ReelFeed card, shimmer. */
export default function ExploreReelsLoading() {
  return (
    <div className="relative lg:static" style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
      <div className="hidden h-full w-full items-center justify-center lg:flex">
        <div className="relative h-full aspect-[9/16] overflow-hidden rounded-xl">
          <div className="skeleton-shimmer absolute left-4 top-4 h-11 w-11 rounded-xl" />
          <div className="skeleton-shimmer absolute left-20 top-4 h-3.5 w-40 rounded" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
            <div className="skeleton-shimmer h-4 w-3/4 rounded" />
            <div className="skeleton-shimmer h-3 w-1/2 rounded" />
            <div className="skeleton-shimmer mt-3 h-9 w-36 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="flex h-full w-full flex-col justify-between p-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer h-11 w-11 rounded-xl" />
          <div className="space-y-2">
            <div className="skeleton-shimmer h-3.5 w-40 rounded" />
            <div className="skeleton-shimmer h-3 w-24 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer h-3 w-1/2 rounded" />
          <div className="skeleton-shimmer mt-3 h-9 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
