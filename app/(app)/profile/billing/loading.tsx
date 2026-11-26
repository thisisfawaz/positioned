import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /profile/billing: page header then an empty-state area. */
export default function BillingLoading() {
  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}
