/** Mirrors /profile/work/new: back header, intro text, then the work form card. */
export default function NewWorkLoading() {
  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center gap-3">
        <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
        <div className="skeleton-shimmer h-6 w-32 rounded" />
      </div>

      <div className="max-w-2xl px-3 py-3 sm:px-4 sm:py-4">
        <div className="skeleton-shimmer mb-6 h-4 w-2/3 rounded" />
      </div>

      <div className="card space-y-4 p-6 md:p-8">
        <div className="skeleton-shimmer h-40 w-full rounded-xl" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="skeleton-shimmer h-3 w-24 rounded" />
            <div className="skeleton-shimmer h-10 w-full rounded-xl" />
          </div>
        ))}
        <div className="skeleton-shimmer h-28 w-full rounded-xl" />
        <div className="skeleton-shimmer h-10 w-32 rounded-xl" />
      </div>
    </div>
  )
}
