import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /[username]/recruitments/[id]: back header, then the role detail card. */
export default function RecruitmentDetailLoading() {
  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="page-header flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="p-3">
        <div className="card space-y-4 p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
