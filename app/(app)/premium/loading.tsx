/** Mirrors /premium: centered 640px column, title, subtitle, feature card. */
export default function PremiumLoading() {
  return (
    <div className="w-full px-3 pb-8 pt-2 sm:px-4 lg:pt-6">
      <div className="mx-auto max-w-[640px]">
        <div className="skeleton-shimmer h-7 w-56 rounded" />
        <div className="skeleton-shimmer mt-2 h-4 w-full max-w-[420px] rounded" />

        <div className="card mt-5 p-5">
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="skeleton-shimmer mt-0.5 h-5 w-5 flex-shrink-0 rounded-full" />
                <div className="skeleton-shimmer h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <div className="skeleton-shimmer h-10 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
