/** Mirrors /[username]/work/[id]: back header, then the work detail body. */
export default function WorkDetailLoading() {
  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="page-header flex items-center gap-3">
        <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
      </div>

      <div className="p-3">
        <div className="overflow-hidden rounded-2xl bg-white">
          <div className="skeleton-shimmer aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <div className="skeleton-shimmer h-5 w-2/3 rounded" />
            <div className="skeleton-shimmer h-3 w-1/3 rounded" />
            <div className="space-y-2 pt-2">
              <div className="skeleton-shimmer h-3 w-full rounded" />
              <div className="skeleton-shimmer h-3 w-11/12 rounded" />
              <div className="skeleton-shimmer h-3 w-3/4 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
