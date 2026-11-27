/** Mirrors /profile/professionals/[id]: back header, then the profile card. */
export default function ProfessionalDetailLoading() {
  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center gap-3">
        <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
        <div className="skeleton-shimmer h-6 w-40 rounded" />
      </div>

      <div className="p-4">
        <div className="card p-6 md:p-8">
          <div className="flex items-start gap-6">
            <div className="skeleton-shimmer h-20 w-20 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="skeleton-shimmer h-6 w-48 rounded" />
              <div className="skeleton-shimmer h-4 w-32 rounded" />
              <div className="skeleton-shimmer h-3 w-40 rounded" />
              <div className="space-y-2 pt-2">
                <div className="skeleton-shimmer h-3 w-full rounded" />
                <div className="skeleton-shimmer h-3 w-11/12 rounded" />
                <div className="skeleton-shimmer h-3 w-2/3 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
