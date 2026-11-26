import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /profile/professionals/[id]: back header, then the profile card. */
export default function ProfessionalDetailLoading() {
  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div className="p-4">
        <div className="card p-6 md:p-8">
          <div className="flex items-start gap-6">
            <Skeleton className="h-20 w-20 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-11/12" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
