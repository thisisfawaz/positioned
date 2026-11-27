/** Mirrors /responses: header + one card per post (thumb + title + count). */
export default function ResponsesLoading() {
  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <div className="skeleton-shimmer h-7 w-40 rounded" />
        <div className="skeleton-shimmer mt-2 h-4 w-56 rounded" />
      </div>

      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl bg-surface py-3 pl-[5px] pr-3">
            <div className="skeleton-shimmer h-14 w-14 flex-shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-48 rounded" />
              <div className="skeleton-shimmer h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
