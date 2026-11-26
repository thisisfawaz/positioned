import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Generic route skeleton - a safety net for any (app) route that somehow has
 * no specific loading.tsx. Header bar + a few content rows, so the user always
 * sees a shaped placeholder instead of a blank screen or a spinner. Every real
 * route now carries its own route-specific skeleton.
 */
export default function AppLoading() {
  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />

      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="card flex items-center gap-3 p-4">
            <Skeleton className="h-11 w-11 flex-shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
