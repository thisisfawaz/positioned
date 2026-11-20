import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /profile/visibility: title, four stat cards, work list, boost card. */
export default function VisibilityLoading() {
  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-4 sm:gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-surface-sunken p-4 sm:p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-6 w-12" />
          </div>
        ))}
      </div>

      <section className="mb-3 rounded-xl bg-surface-sunken p-4 sm:mb-4 sm:p-5">
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-surface-sunken p-4 sm:p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="mt-1 h-3 w-5/6" />
        <Skeleton className="mt-4 h-24 w-full rounded-xl" />
      </section>
    </div>
  )
}
