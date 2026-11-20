import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /profile/saved-professionals: header + stacked person cards. */
export default function SavedProfessionalsLoading() {
  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header">
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="space-y-3 p-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card block p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="h-11 w-11 flex-shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
