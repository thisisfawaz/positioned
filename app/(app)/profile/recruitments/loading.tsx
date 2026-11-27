/** Mirrors /profile/recruitments: header with CTA button, then role cards. */
export default function MyRecruitmentsLoading() {
  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center justify-between gap-4">
        <div className="skeleton-shimmer h-6 w-44 rounded" />
        <div className="skeleton-shimmer h-9 w-28 rounded-xl" />
      </div>

      <div className="space-y-3 p-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card block p-5">
            <div className="skeleton-shimmer h-3.5 w-48 rounded" />
            <div className="skeleton-shimmer mt-2 h-3 w-40 rounded" />
            <div className="skeleton-shimmer mt-3 h-3 w-24 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
