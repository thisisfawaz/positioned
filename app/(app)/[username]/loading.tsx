import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Profile skeleton - matches ProfileBody: cover banner, overlapping avatar,
 * name and handle, title line, bio, then the posts section.
 *
 * Without this, a profile route fell back to the app-level skeleton, which used
 * to be feed-shaped - so the page visibly morphed from a feed into a profile.
 */
export default function ProfileLoading() {
  return (
    <div className="w-full pb-4">
      <div className="overflow-hidden rounded-[1.25rem] border border-line bg-white">
        {/* Cover */}
        <Skeleton className="h-32 rounded-none" />

        <div className="px-4 pb-4">
          {/* Avatar overlaps the cover, as in the real page */}
          <div className="-mt-12 flex items-end justify-between">
            <Skeleton className="h-24 w-24 rounded-[1.5rem] border-4 border-white" />
            <Skeleton className="mb-1 h-9 w-28 rounded-xl" />
          </div>

          <div className="mt-3 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>

          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>

        {/* Section heading */}
        <div className="border-b border-line px-4 py-3">
          <Skeleton className="h-3.5 w-24" />
        </div>

        {/* One post card */}
        <div className="p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-5/6" />
          <Skeleton className="mt-3 h-3 w-40" />
        </div>
      </div>
    </div>
  )
}
