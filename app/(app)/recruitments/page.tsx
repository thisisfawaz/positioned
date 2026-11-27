'use client'

import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import { PostTileGrid, type GridItem } from '@/components/explore/PostTileGrid'
import { SearchIcon } from '@/components/icons'

/**
 * Recruitments - an Explore-style masonry grid of recruiter-owned posts.
 *
 * Same tile component as Explore (PostTileGrid), same masonry columns and tall
 * rhythm. A tile shows the media image (or gradient initials fallback), the
 * recruiter's name and the role title, and opens the recruitments reel at that
 * post - exactly how Explore opens its own reel.
 *
 * The header + search stay real while the grid loads; the grid shows shimmer
 * tiles until items arrive (binary: content, else shimmer - no blank middle).
 */
export default function RecruitmentsPage() {
  const [query, setQuery] = useState('')
  const qs = query ? `?q=${encodeURIComponent(query)}` : ''
  const { data, isLoading } = useSWR<{ items: GridItem[]; nextCursor: string | null }>(
    `/api/recruitment-grid${qs}`
  )

  const items = data?.items ?? []

  return (
    <div className="w-full pb-6">
      <div className="px-3 pt-2 sm:px-4 lg:pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-[26px]">
              Recruitments
            </h1>
            <p className="mt-1 text-[14px] text-ink-muted">
              Open roles from recruiters on Positioned.
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles, organizations or keywords..."
            className="w-full rounded-xl border border-transparent bg-surface-sunken py-3 pl-10 pr-4 text-[14px] text-ink placeholder:text-ink-subtle focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/10"
          />
        </div>
      </div>

      <div className="mt-4 px-3 sm:px-4">
        {isLoading ? (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {Array.from({ length: 12 }).map((_, i) => {
              const tall = i % 5 === 0 || i % 7 === 0
              return (
                <div
                  key={i}
                  className="relative mb-3 break-inside-avoid overflow-hidden rounded-xl"
                >
                  <div
                    className={`skeleton-shimmer w-full rounded-xl ${
                      tall ? 'aspect-[3/4]' : 'aspect-square'
                    }`}
                  />
                  <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-2.5">
                    <div className="skeleton-shimmer h-[11px] w-2/3 rounded" />
                    <div className="skeleton-shimmer h-[9px] w-1/2 rounded" />
                  </div>
                </div>
              )
            })}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-ink-subtle">
              {query ? 'No roles match your search.' : 'No open roles yet.'}
            </p>
          </div>
        ) : (
          <RecruitmentGrid items={items} />
        )}
      </div>
    </div>
  )
}

/** Same masonry as PostTileGrid, but tiles link to the recruitments reel. */
function RecruitmentGrid({ items }: { items: GridItem[] }) {
  return (
    <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
      {items.map((item, i) => {
        const tall = i % 5 === 0 || i % 7 === 0
        const href = `/recruitments/reels?post=${item.postId ?? item.id}`
        return (
          <Link
            key={item.id}
            href={href}
            className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-xl bg-surface-sunken"
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.name}
                className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
                  tall ? 'aspect-[3/4]' : 'aspect-square'
                }`}
              />
            ) : (
              <div
                className={`flex w-full items-center justify-center bg-gradient-to-br from-brand-light to-surface-sunken text-[20px] font-bold text-ink ${
                  tall ? 'aspect-[3/4]' : 'aspect-square'
                }`}
              >
                {item.name?.[0] ?? 'R'}
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2.5 pt-8">
              <p className="truncate text-[13px] font-semibold text-white">{item.name}</p>
              {item.title && (
                <p className="truncate text-[11px] text-white/75">{item.title}</p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
