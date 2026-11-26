import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /profile/professionals: title + subtitle, search row, then person cards. */
export default function ProfessionalsLoading() {
  return (
    <div className="flex-1 min-w-0 w-full pb-4 pt-2">
      <div className="mb-4">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <div className="mb-3 flex gap-2">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>

      <ul className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="rounded-[1.25rem] border border-line bg-white p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
