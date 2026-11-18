import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Mirrors the real settings page: left-aligned px-4 column, max-w-[720px] body,
 * and four rounded-2xl sections (Account, Notifications, Privacy, Appearance).
 */
export default function SettingsLoading() {
  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mb-4 mt-2 h-4 w-56" />

      <div className="max-w-[720px] space-y-3">
        {/* Account */}
        <div className="rounded-2xl bg-white p-5">
          <Skeleton className="mb-4 h-4 w-20" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        {/* Notifications / Privacy */}
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl bg-white p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mb-4 mt-2 h-3 w-64" />
            <div className="space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Appearance */}
        <div className="rounded-2xl bg-white p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mb-4 mt-2 h-3 w-72" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
