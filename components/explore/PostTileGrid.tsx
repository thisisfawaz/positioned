'use client'

import Link from 'next/link'
import { initialsOf } from '@/lib/client/social'

export type GridItem = {
  id: string
  userId: string
  name: string
  username: string | null
  title: string | null
  profilePhoto: string | null
  postId: string | null
  image: string | null
}

/**
 * Where a tile with a post should link to.
 * - `exploreReel` -> `/explore/reels?post=<id>` (Explore's own reel)
 * - `authorReel`  -> `/[username]/reels?post=<id>` (that person's own reel)
 * - `savedReel`   -> `/profile/saved-work/reels?post=<id>` (the viewer's saved reel)
 *
 * This is a STRING MODE, not a callback, on purpose: this component is a client
 * component and is also rendered by a SERVER component (Saves). Passing a
 * function prop across the server->client boundary throws at runtime
 * ("Functions cannot be passed directly to Client Components"). A serializable
 * mode string avoids that and keeps tsc/build happily unaware of the pitfall.
 */
export type TileHrefKind = 'exploreReel' | 'authorReel' | 'savedReel'

function hrefForItem(item: GridItem, kind: TileHrefKind): string {
  if (item.postId) {
    if (kind === 'exploreReel') return `/explore/reels?post=${item.postId}`
    if (kind === 'savedReel') return `/profile/saved-work/reels?post=${item.postId}`
    return `/${item.username || item.userId}/reels?post=${item.postId}`
  }
  return `/${item.username || item.userId}`
}

/**
 * The masonry tile grid shared by Explore and Saves.
 *
 * Pure presentation: it renders whatever `items` it is given and builds each
 * tile's link from `hrefKind`. It knows nothing about pagination, filtering or
 * scroll restoration - those belong to the caller (ExploreGrid owns the infinite
 * scroll; the Saves page just renders its full list).
 *
 * `onTileClick` is OPTIONAL and only used by client callers (Explore's
 * round-trip flag). Do NOT pass it from a server component.
 */
export function PostTileGrid({
  items,
  hrefKind,
  onTileClick,
}: {
  items: GridItem[]
  hrefKind: TileHrefKind
  onTileClick?: () => void
}) {
  return (
    <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
      {items.map((item, i) => {
        const href = hrefForItem(item, hrefKind)
        const tall = i % 5 === 0 || i % 7 === 0
        return (
          <Link
            key={item.id}
            href={href}
            onClick={onTileClick}
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
                {initialsOf(item.name)}
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
