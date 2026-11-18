import Link from 'next/link'

/**
 * In-app 404.
 *
 * Without this file, any `notFound()` call - most importantly the one in
 * `[username]/page.tsx` when a profile lookup misses - renders Next's bare
 * default page with no nav, sidebar, or styling. That reads as "the site is
 * broken" rather than "that page does not exist".
 */
export default function AppNotFound() {
  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="card p-12 text-center">
        <h1 className="text-[22px] font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          That page does not exist, or you no longer have access to it.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/feed" className="btn-primary text-sm px-5 py-2">
            Go to feed
          </Link>
          <Link href="/explore" className="btn-secondary text-sm px-5 py-2">
            Explore
          </Link>
        </div>
      </div>
    </div>
  )
}
