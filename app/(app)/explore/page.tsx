'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { ExploreGrid, type GridItem } from '@/components/explore/ExploreGrid'
import { Skeleton } from '@/components/ui/Skeleton'
import { SearchIcon, SlidersIcon } from '@/components/icons'

const CATEGORIES = ['All', 'Design', 'Technology', 'Business', 'Education', 'Marketing', 'Engineering']

/**
 * Explore, matching the reference: a photo grid of people's work with their
 * name and role overlaid on each tile.
 *
 * Data comes from /api/explore-grid, NOT /api/professionals - the latter has no
 * media. A person with no published image renders as a neutral tile; there are
 * no stock or generated placeholder photos anywhere on this page.
 */
export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  // A stable seed per mount so the grid is RANDOMISED on load but does not
  // re-shuffle on every render (search typing, SWR revalidation).
  const [seed] = useState(() => Math.random())

  // SCROLL RESTORATION AND INFINITE LOADING LIVE IN ExploreGrid NOW. The old
  // effect here restored immediately on mount, BEFORE the grid had re-expanded,
  // which fought the new one and landed in the wrong place. Do not add a second
  // copy.
  //
  // The page fetches the FIRST 48 posts only; ExploreGrid keeps paging through
  // /api/explore-grid via the `nextCursor` it hands back, until every post has
  // been shown. `take=48` here is the user's requested first batch.
  const { data, isLoading } = useSWR<{ items: GridItem[]; nextCursor: string | null }>(
    '/api/explore-grid?take=48'
  )

  const { items, cursor } = useMemo(() => {
    // REAL POSTS ONLY. The demo-people fallback was removed: Explore is now a
    // grid of actual professional posts from /api/explore-grid, and showing
    // invented people here made it read as a wall of random usernames.
    let list = data?.items ?? []
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((i) =>
        [i.name, i.title, i.username].filter(Boolean).join(' ').toLowerCase().includes(q)
      )
    }
    // Category filtering is client-side on the role text. There is no taxonomy
    // column on the profile yet, so this is a text match, not a real facet.
    if (category !== 'All') {
      list = list.filter((i) => (i.title ?? '').toLowerCase().includes(category.toLowerCase()))
    }
    // RANDOMISE the order for this mount. Seeded so it is stable across
    // re-renders while still differing from the server's newest-first order.
    const rank = (id: string) => {
      let h = 0
      for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000
      return (h / 100000 + seed) % 1
    }
    list = [...list].sort((a, b) => rank(a.id) - rank(b.id))
    return { items: list, cursor: data?.nextCursor ?? null }
  }, [data, query, category, seed])

  return (
    <div className="w-full pb-6">
      <div className="px-3 pt-2 sm:px-4 lg:pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-[26px]">Explore</h1>
            <p className="mt-1 text-[14px] text-ink-muted">
              Discover professionals and the work they&apos;re showcasing.
            </p>
          </div>
          <button
            type="button"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-xl px-2 py-2 text-[13px] font-medium text-ink-muted hover:text-ink"
          >
            <SlidersIcon className="h-[17px] w-[17px]" />
            Filters
          </button>
        </div>

        {/* Search */}
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

        {/* Category chips */}
        <div className="scroll-hidden -mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:-mx-4 sm:px-4">
          {CATEGORIES.map((c) => {
            const active = c === category
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-brand text-white'
                    : 'bg-surface-sunken text-ink-muted hover:text-ink'
                }`}
              >
                {c}
              </button>
            )
          })}
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
            <p className="text-[14px] text-ink-subtle">Nothing to show yet.</p>
          </div>
        ) : (
          <ExploreGrid
            initialItems={items}
            initialCursor={cursor}
            query={query}
            category={category}
          />
        )}
      </div>
    </div>
  )
}
