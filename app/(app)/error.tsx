'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Error boundary for the (app) segment.
 *
 * Without it, a thrown error inside a server component renders Next's bare
 * default error page. This keeps the shell and gives the user a way back.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app error boundary]', error)
  }, [error])

  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="card p-12 text-center">
        <h1 className="text-[22px] font-bold text-ink">Something went wrong</h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          That page failed to load. Try again, or go back to the feed.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary text-sm px-5 py-2">
            Try again
          </button>
          <Link href="/feed" className="btn-secondary text-sm px-5 py-2">
            Go to feed
          </Link>
        </div>
      </div>
    </div>
  )
}
