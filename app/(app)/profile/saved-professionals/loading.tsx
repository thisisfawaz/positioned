/** Mirrors /profile/saved-professionals: header + stacked person cards. */
export default function SavedProfessionalsLoading() {
  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header">
        <div className="skeleton-shimmer h-6 w-48 rounded" />
      </div>

      <div className="space-y-3 p-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card block p-5">
            <div className="flex items-start gap-3">
              <div className="skeleton-shimmer h-11 w-11 flex-shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-3.5 w-40 rounded" />
                <div className="skeleton-shimmer h-3 w-32 rounded" />
                <div className="skeleton-shimmer h-3 w-24 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
