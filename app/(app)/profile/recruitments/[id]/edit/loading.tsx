/** Mirrors /profile/recruitments/[id]/edit: back header + a form card. */
export default function EditRecruitmentLoading() {
  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center gap-3">
        <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
        <div className="skeleton-shimmer h-6 w-28 rounded" />
      </div>
      <div className="p-3 max-w-2xl">
        <div className="card space-y-4 p-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton-shimmer h-3 w-24 rounded" />
              <div className="skeleton-shimmer h-10 w-full rounded-xl" />
            </div>
          ))}
          <div className="skeleton-shimmer h-28 w-full rounded-xl" />
          <div className="skeleton-shimmer h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
