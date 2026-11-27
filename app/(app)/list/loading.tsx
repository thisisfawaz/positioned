/** Mirrors /list: header + ListRow rows (h-11 round avatar, rounded-2xl white row). */
export default function ListLoading() {
  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <div className="skeleton-shimmer h-7 w-32 rounded" />
        <div className="skeleton-shimmer mt-2 h-4 w-64 rounded" />
      </div>

      <ul className="space-y-1">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="flex items-center gap-3 rounded-2xl bg-white py-3 pl-[5px] pr-4">
            <div className="skeleton-shimmer h-11 w-11 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-40 rounded" />
              <div className="skeleton-shimmer h-3 w-28 rounded" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
