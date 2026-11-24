'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PostTileGrid, type GridItem } from '@/components/explore/PostTileGrid'

export type { GridItem }

// How many tiles are added to the DOM each time the sentinel is reached.
const REVEAL = 20

/**
 * Explore's masonry grid.
 *
 * The FIRST 48 posts are handed in by the page (server-side, via SWR). After
 * that this component keeps the grid going INFINITELY: whenever the revealed
 * count catches up with what is loaded, it fetches the next page from
 * /api/explore-grid?cursor=<lastId> and appends it. It stops only when the API
 * returns `nextCursor: null` - i.e. every matching post has been reached.
 *
 * Rules carried over from the profile grid (both learned from bugs there):
 * - the observer only fires after a REAL scroll, so a fresh mount does not
 *   immediately load a second batch;
 * - the revealed count, loaded items and scroll offset survive a round trip
 *   through a post, so coming back does not collapse the grid.
 *
 * A tile opens `/explore/reels?post=<id>` - Explore's OWN reel, not the home
 * feed. Tiles with no post fall back to the profile.
 */
export function ExploreGrid({
  initialItems,
  initialCursor,
  query,
  sort,
  media,
}: {
  initialItems: GridItem[]
  initialCursor: string | null
  query: string
  sort: string
  media: string
}) {
  const STORE_KEY = 'explore:grid'
  const RETURN_KEY = `${STORE_KEY}:returning`

  // Read the return flag ONCE, before the `visible` initializer consumes it.
  const [returning] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const wasReturning = sessionStorage.getItem(RETURN_KEY) === '1'
      sessionStorage.removeItem(RETURN_KEY)
      return wasReturning
    } catch {
      return false
    }
  })

  // Filters are SERVER-SIDE now (see /api/explore-grid): search, sort and media
  // type are part of the request, so paging through results works normally and
  // this grid never needs to crawl the whole set to filter locally.

  const [items, setItems] = useState<GridItem[]>(initialItems)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadingRef = useRef(false)

  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined' || !returning) return Math.min(48, initialItems.length)
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}')
      return typeof saved.visible === 'number'
        ? Math.max(48, saved.visible)
        : Math.min(48, initialItems.length)
    } catch {
      return Math.min(48, initialItems.length)
    }
  })

  // When the search text or category changes, the page hands back a NEW filtered
  // first-48 batch. Drop the pages fetched under the previous filter, otherwise
  // stale tiles from another filter keep showing. Uses the filter signature as
  // the trigger so an SWR revalidation that returns the same filter does not
  // collapse a grid the user has already scrolled through.
  const filterKey = `${query}\u0000${sort}\u0000${media}`
  const lastFilter = useRef(filterKey)
  useEffect(() => {
    if (lastFilter.current === filterKey) return
    lastFilter.current = filterKey
    setItems(initialItems)
    setCursor(initialCursor)
    setVisible(Math.min(48, initialItems.length))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  const sentinel = useRef<HTMLDivElement | null>(null)
  const hasScrolled = useRef(false)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ visible }))
    } catch {
      // ignore
    }
  }, [STORE_KEY, visible])

  useEffect(() => {
    if (!returning) return
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}')
      if (typeof saved.scrollY === 'number' && saved.scrollY > 0) {
        requestAnimationFrame(() => window.scrollTo(0, saved.scrollY))
      }
    } catch {
      // ignore
    }
  }, [STORE_KEY, returning])

  useEffect(() => {
    const save = () => {
      try {
        const prev = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}')
        sessionStorage.setItem(
          STORE_KEY,
          JSON.stringify({ ...prev, scrollY: window.scrollY })
        )
      } catch {
        // ignore
      }
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      window.removeEventListener('scroll', save)
      save()
    }
  }, [STORE_KEY])

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) hasScrolled.current = true
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch the next page. Guarded by a ref so overlapping observer callbacks
  // cannot fire two requests for the same cursor.
  // The seed is issued by the FIRST page and carried in every cursor, so all
  // pages of one visit share the same shuffle. Stored in a ref because it must
  // not trigger a re-render or an effect re-run.
  const seedRef = useRef<string | null>(null)
  if (seedRef.current === null && initialCursor && initialCursor.includes('|')) {
    seedRef.current = initialCursor.split('|')[0]
  }

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !cursor) return
    loadingRef.current = true
    setLoadingMore(true)
    try {
      const tz =
        typeof Intl !== 'undefined'
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : 'UTC'
      const params = new URLSearchParams({ take: '48', cursor, tz })
      if (query.trim()) params.set('q', query.trim())
      if (sort) params.set('sort', sort)
      if (media) params.set('media', media)
      if (seedRef.current) params.set('seed', seedRef.current)
      const res = await fetch(`/api/explore-grid?${params.toString()}`)
      if (!res.ok) throw new Error('Fetch failed')
      const data: { items: GridItem[]; nextCursor: string | null } = await res.json()
      // De-dupe defensively against a boundary post slipping through.
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id))
        return [...prev, ...data.items.filter((i) => !seen.has(i.id))]
      })
      setCursor(data.nextCursor)
    } catch {
      // Leave `cursor` unchanged so the next intersection can retry.
    } finally {
      loadingRef.current = false
      setLoadingMore(false)
    }
  }, [cursor, query, sort, media])

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || !hasScrolled.current) return
        // If there are loaded-but-hidden items, reveal them first. Otherwise
        // pull the next page from the server (unless the user is filtering).
        if (visible < items.length) {
          setVisible((v) => Math.min(v + REVEAL, items.length))
        } else {
          void loadMore()
        }
      },
      { rootMargin: '50px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [items.length, visible, loadMore])

  // After a page arrives and the user is still near the bottom, keep revealing:
  // the sentinel will not re-intersect on its own because it never left view.
  useEffect(() => {
    if (visible < items.length && hasScrolled.current) {
      const el = sentinel.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight + 50) {
        setVisible((v) => Math.min(v + REVEAL, items.length))
      }
    }
  }, [items.length, visible])

  function markReturning() {
    try {
      sessionStorage.setItem(RETURN_KEY, '1')
    } catch {
      // ignore
    }
  }

  const shown = items.slice(0, visible)
  const hasMoreToLoad = cursor !== null
  const showSentinel = visible < items.length || hasMoreToLoad

  return (
    <>
      <PostTileGrid items={shown} hrefKind="exploreReel" onTileClick={markReturning} />
      {showSentinel && (
        <div ref={sentinel} className="flex h-12 items-center justify-center">
          {loadingMore && (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-brand" />
          )}
        </div>
      )}
      {!hasMoreToLoad && items.length > 0 && visible >= items.length && (
        <p className="py-6 text-center text-[13px] text-ink-subtle">You&apos;re all caught up.</p>
      )}
    </>
  )
}
