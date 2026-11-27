/** Mirrors /profile/billing: header + empty-state area. */
export default function BillingLoading() {
  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header">
        <div className="skeleton-shimmer h-6 w-24 rounded" />
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="skeleton-shimmer h-4 w-40 rounded" />
      </div>
    </div>
  )
}
