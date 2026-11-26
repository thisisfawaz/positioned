import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /requests/[id]: back header, then the share-documents card + form. */
export default function FulfilRequestLoading() {
  return (
    <div className="flex-1 min-w-0 w-full pb-4 pt-2">
      <div className="page-header flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div className="max-w-2xl px-3 py-3 sm:px-4 sm:py-4">
        <div className="card space-y-4 p-6 md:p-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <div className="space-y-3 pt-2">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
