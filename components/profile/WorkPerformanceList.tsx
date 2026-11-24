'use client'

import { useState } from 'react'
import { AllPostsModal } from '@/components/profile/AllPostsModal'
import { ArrowIcon } from '@/components/icons'

type Row = {
  id: string
  title: string
  views: number
  recruiterViews: number
  likes: number
  saves: number
  boosted: boolean
  image: string | null
}

const VISIBLE = 4

/**
 * Work performance: the first 4 posts with thumbnails, plus an "All posts"
 * popup listing every post (including those already shown).
 */
export function WorkPerformanceList({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState(false)
  const shown = rows.slice(0, VISIBLE)

  if (rows.length === 0) {
    return <p className="text-[14px] text-ink-muted">You have not published any work yet.</p>
  }

  return (
    <>
      {/* Shows the first VISIBLE posts, no inner scroll: the card grows to fit
          all of them. Anything beyond VISIBLE is reachable through "All posts",
          which opens a popup that fills the phone screen and scrolls itself. */}
      <ul className="divide-y divide-line">
        {shown.map((post) => (
          <li key={post.id} className="flex items-center gap-3 py-3">
            {post.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.image}
                alt={post.title}
                className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-surface-sunken" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-ink">{post.title}</p>
              <p className="mt-0.5 text-[13px] text-ink-subtle">
                {post.views} views · {post.recruiterViews} recruiter · {post.likes} likes ·{' '}
                {post.saves} saves
              </p>
            </div>
            {post.boosted && (
              <span className="flex-shrink-0 rounded-md bg-brand-light px-2 py-0.5 text-[11px] font-semibold text-ink">
                boosted
              </span>
            )}
          </li>
        ))}
      </ul>

      {rows.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-ink hover:underline"
        >
          All posts
          <ArrowIcon className="h-3.5 w-3.5" />
        </button>
      )}

      <AllPostsModal open={open} onClose={() => setOpen(false)} rows={rows} />
    </>
  )
}
