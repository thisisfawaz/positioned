import { Skeleton } from '@/components/ui/Skeleton'

/** Mirrors /recruitments: title + subtitle, search row, then job cards. */
export default function RecruitmentsLoading() {
  return (
    <div className="flex-1 min-w-0 w-full pb-4 pt-2">
      <div className="mb-4">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <div className="mb-3 flex gap-2">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>

      <ul className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="rounded-[1.25rem] border border-line bg-white p-5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-2 h-3.5 w-3/4" />
            <Skeleton className="mt-3 h-3 w-32" />
          </li>
        ))}
      </ul>
    </div>
  )
}
