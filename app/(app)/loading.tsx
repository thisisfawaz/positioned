import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Fallback for any (app) route without its own loading.tsx.
 *
 * This used to render a three-column FEED skeleton - rails, composer, tabs,
 * cards - even though the real shell already provides the rails via
 * layout.tsx. On a non-feed route that showed a fake feed before the real page
 * appeared. It is now a neutral middle-column placeholder; routes with a known
 * shape (profile, work, settings, messages) have their own loading.tsx.
 */
export default function AppLoading() {
  return (
    <div className="w-full pb-4">
      <div className="card p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-24" />
      </div>

      <div className="mt-4 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
