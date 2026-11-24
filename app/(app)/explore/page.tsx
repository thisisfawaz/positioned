'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { ExploreGrid, type GridItem } from '@/components/explore/ExploreGrid'
import { Skeleton } from '@/components/ui/Skeleton'
import { Modal } from '@/components/ui/Modal'
import { SearchIcon, SlidersIcon, CheckIcon } from '@/components/icons'

/** Sort options. These map 1:1 to the API's `sort` param. */
// There is no "Newest" option: the default (no sort chosen) IS the daily
// random shuffle, which is what makes Explore show a random 100 of today.
// These options reorder WITHIN that random sample of the day's posts.
const SORTS = [
  { id: 'liked', label: 'Most liked' },
  { id: 'viewed', label: 'Most viewed' },
  { id: 'saved', label: 'Most saved' },
] as const

/** Media-type options. These map 1:1 to the API's `media` param. */
// Video is intentionally absent: uploaded video is not enabled yet (the
// PostMediaType.VIDEO enum has not been applied to the database).
const MEDIA = [
  { id: 'all', label: 'All media' },
  { id: 'image', label: 'Images' },
] as const

const DEFAULT_SORT = ''
const DEFAULT_MEDIA = 'all'

/**
 * Explore: a grid of real published work, searchable across EVERY post (not
 * just the loaded batch) with a real filters panel.
 *
 * Search, sort and media type are all applied SERVER-SIDE by
 * /api/explore-grid, so paging keeps working while filtering. The old
 * category chips were removed: they matched a substring against the author's
 * job title, so "Engineering" only found people whose title happened to
 * contain that word - a fake facet over data that has no taxonomy.
 */
export default function ExplorePage() {
  const [query, setQuery] = useState('')
  // Debounce so typing does not fire a request per keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sort, setSort] = useState<string>(DEFAULT_SORT)
  const [media, setMedia] = useState<string>(DEFAULT_MEDIA)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query])

  // The viewer's IANA timezone scopes "today" to THEIR local day, not UTC.
  // Resolved in an effect so the server render does not read a browser API;
  // until then it falls back to UTC and the key updates once on mount.
  const [tz, setTz] = useState('UTC')
  useEffect(() => {
    try {
      const z = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (z) setTz(z)
    } catch {
      // keep UTC
    }
  }, [])

  const params = new URLSearchParams({ take: '48', tz })
  if (debouncedQuery) params.set('q', debouncedQuery)
  if (sort !== DEFAULT_SORT) params.set('sort', sort)
  if (media !== DEFAULT_MEDIA) params.set('media', media)
  const swrKey = `/api/explore-grid?${params.toString()}`

  const { data, isLoading } = useSWR<{ items: GridItem[]; nextCursor: string | null }>(swrKey)

  const items = data?.items ?? []
  const cursor = data?.nextCursor ?? null

  const activeCount =
    (sort !== DEFAULT_SORT ? 1 : 0) + (media !== DEFAULT_MEDIA ? 1 : 0)

  // Clicking the active sort again clears it, returning to the daily shuffle.

  return (
    <div className="w-full pb-6">
      <div className="px-3 sm:px-4 lg:pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-[26px]">Explore</h1>
            <p className="mt-1 text-[14px] text-ink-muted">
              Discover professionals and the work they&apos;re showcasing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-xl px-2 py-2 text-[13px] font-medium text-ink-muted hover:text-ink"
          >
            <SlidersIcon className="h-[17px] w-[17px]" />
            Filters
            {activeCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Search - server-side, debounced. */}
        <div className="relative mt-4">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, skills, professions or work..."
            className="w-full rounded-xl border border-transparent bg-surface-sunken py-3 pl-10 pr-4 text-[14px] text-ink placeholder:text-ink-subtle focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/10"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="mt-4 px-3 sm:px-4">
        {isLoading ? (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const tall = i % 5 === 0 || i % 7 === 0
              return (
                <div key={i} className="mb-3 break-inside-avoid overflow-hidden rounded-xl">
                  <Skeleton
                    className={`w-full rounded-xl ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}
                  />
                </div>
              )
            })}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-ink-subtle">
              {debouncedQuery || activeCount > 0 ? 'No results match your filters.' : 'Nothing to show yet.'}
            </p>
          </div>
        ) : (
          <ExploreGrid
            initialItems={items}
            initialCursor={cursor}
            query={debouncedQuery}
            sort={sort}
            media={media}
          />
        )}
      </div>

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        ariaLabel="Explore filters"
        maxWidth="max-w-[480px]"
      >
        <div className="space-y-6">
          <section>
            <h3 className="text-[13px] font-semibold text-ink">Sort by</h3>
            <div className="mt-2 space-y-1.5">
              {SORTS.map((s) => (
                <FilterRow
                  key={s.id}
                  label={s.label}
                  active={sort === s.id}
                  onClick={() => setSort(sort === s.id ? DEFAULT_SORT : s.id)}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[13px] font-semibold text-ink">Media type</h3>
            <div className="mt-2 space-y-1.5">
              {MEDIA.map((m) => (
                <FilterRow
                  key={m.id}
                  label={m.label}
                  active={media === m.id}
                  onClick={() => setMedia(m.id)}
                />
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <button
              type="button"
              onClick={() => {
                setSort(DEFAULT_SORT)
                setMedia(DEFAULT_MEDIA)
              }}
              className="text-[13px] font-medium text-ink-muted hover:text-ink"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="rounded-xl bg-[var(--brand-black)] px-4 py-2 text-[13px] font-semibold text-[var(--surface)]"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/** One selectable row in the filters panel. */
function FilterRow({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <label
      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-[14px] transition-colors ${active ? 'bg-brand-light text-ink' : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'}`}
    >
      <input
        type="checkbox"
        checked={active}
        onChange={onClick}
        className="h-4 w-4 flex-shrink-0 cursor-pointer accent-[var(--brand-black)]"
      />
      {label}
    </label>
  )
}

