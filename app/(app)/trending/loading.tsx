import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /trending: title + subtitle, then ranked card rows. */
export default function TrendingLoading() {
  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-52" />
      </div>

      <ol className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="card flex items-center gap-4 p-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
          </li>
        ))}
      </ol>
    </div>
  )
}
