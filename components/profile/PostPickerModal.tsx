'use client'

import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'

type Post = { id: string; title: string; image?: string | null }

const PAGE_SIZE = 20

/**
 * Full-list post picker.
 *
 * The form itself only shows a few posts; this opens the complete list so a
 * user with many posts can find one without scrolling a wall of checkboxes in
 * the main form.
 *
 * Paging is CLIENT-SIDE: all posts are already loaded by the visibility page,
 * so this reveals 20 more as the list is scrolled rather than fetching. The
 * short delay on load is simulated so the loader is visible rather than a
 * flicker - remove the timeout if it feels artificial.
 */
export function PostPickerModal({
  open,
  onClose,
  posts,
  selected,
  onToggle,
}: {
  open: boolean
  onClose: () => void
  posts: Post[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) => p.title.toLowerCase().includes(q))
  }, [posts, query])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visible.length

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    if (loading || !hasMore) return
    const el = e.currentTarget
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80
    if (!nearBottom) return

    setLoading(true)
    // Brief pause so the loader is perceivable instead of flashing.
    window.setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE)
      setLoading(false)
    }, 250)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Your posts"
      ariaLabel="Choose posts to boost"
      maxWidth="max-w-[560px]"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setVisibleCount(PAGE_SIZE)
        }}
        placeholder={`Search ${posts.length} posts…`}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-subtle focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10"
      />

      <p className="mt-1 text-[12px] text-ink-subtle">
        {query.trim()
          ? `${filtered.length} of ${posts.length} match`
          : `${selected.length} selected`}
      </p>

      <div
        onScroll={handleScroll}
        className="scroll-hidden mt-3 max-h-[50vh] space-y-2 overflow-y-auto pr-1"
      >
        {visible.length === 0 ? (
          <p className="rounded-lg bg-surface-sunken px-4 py-3 text-[13px] text-ink-muted">
            No posts match “{query}”.
          </p>
        ) : (
          visible.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line p-2.5 hover:bg-surface-sunken"
            >
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => onToggle(p.id)}
                className="h-4 w-4 flex-shrink-0 cursor-pointer"
              />
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="h-10 w-10 flex-shrink-0 rounded-md bg-surface-sunken" />
              )}
              <span className="min-w-0 text-[14px] text-ink">{p.title}</span>
            </label>
          ))
        )}

        {loading && (
          <p className="py-2 text-center text-[13px] text-ink-subtle">Loading more…</p>
        )}
      </div>

      <button type="button" onClick={onClose} className="btn-primary mt-4 w-full">
        Done
      </button>
    </Modal>
  )
}
