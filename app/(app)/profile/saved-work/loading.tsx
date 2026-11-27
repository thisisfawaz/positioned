/** Mirrors /profile/saved-work: header + masonry grid, same tall rhythm. */
export default function SavedWorkLoading() {
  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <div className="skeleton-shimmer h-7 w-28 rounded" />
        <div className="skeleton-shimmer mt-2 h-4 w-56 rounded" />
      </div>

      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {Array.from({ length: 12 }).map((_, i) => {
          const tall = i % 5 === 0 || i % 7 === 0
          return (
            <div key={i} className="mb-3 break-inside-avoid overflow-hidden rounded-xl">
              <div className={`skeleton-shimmer w-full rounded-xl ${tall ? 'aspect-[3/4]' : 'aspect-square'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
