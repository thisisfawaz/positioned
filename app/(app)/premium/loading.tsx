import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /premium: centered 640px column, title, subtitle, then a feature card. */
export default function PremiumLoading() {
  return (
    <div className="w-full px-3 pb-8 pt-2 sm:px-4 lg:pt-6">
      <div className="mx-auto max-w-[640px]">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-full max-w-[420px]" />

        <div className="card mt-5 p-5">
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
