import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /profile/recruitments: header with a CTA button, then role cards. */
export default function MyRecruitmentsLoading() {
  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      <div className="space-y-3 p-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card block p-5">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="mt-2 h-3 w-40" />
            <Skeleton className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
