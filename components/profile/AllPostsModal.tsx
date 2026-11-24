'use client'

import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'

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

/**
 * "All posts" for the Work performance section.
 *
 * The section itself shows the first 4; this lists EVERY post, including those
 * already visible above, so the two never disagree about what exists.
 */
export function AllPostsModal({
  open,
  onClose,
  rows,
  handle,
}: {
  open: boolean
  onClose: () => void
  rows: Row[]
  handle?: string | null
}) {
  return (
    <Modal open={open} onClose={onClose} title="All posts" ariaLabel="All posts">
      {/* Mobile: the panel is full-screen and scrolls (see Modal), so the
          list must NOT cap its height - a 60vh cap left the bottom of the
          phone as a dead blocked area. Desktop keeps the inner scroll so the
          rounded card stays a sensible size. */}
      <ul className="scroll-hidden divide-y divide-line sm:max-h-[60vh] sm:overflow-y-auto">
        {rows.map((post) => (
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
    </Modal>
  )
}
