'use client'

import { useEffect, useRef } from 'react'
import { PostTileGrid, type GridItem } from '@/components/explore/PostTileGrid'

const STORE_KEY = 'saves:grid'
const RETURN_KEY = `${STORE_KEY}:returning`

/**
 * The Saves grid + scroll restoration.
 *
 * Saves is a single server-rendered batch (no pagination), so the ONLY job here
 * is the round trip: when a tile is clicked we set a `returning` flag and save
 * the scroll offset; when the user comes Back from the reel we restore that
 * offset so they land where they were. Same mechanism as ExploreGrid, minus the
 * infinite-scroll plumbing.
 *
 * `hrefKind="savedReel"` sends tiles to the Saves-scoped reel, NOT the author's
 * reel or the global feed.
 */
export function SavedWorkGrid({ items }: { items: GridItem[] }) {
  const restored = useRef(false)

  useEffect(() => {
    if (restored.current) return
    restored.current = true
    try {
      const wasReturning = sessionStorage.getItem(RETURN_KEY) === '1'
      sessionStorage.removeItem(RETURN_KEY)
      if (!wasReturning) return
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}')
      if (typeof saved.scrollY === 'number' && saved.scrollY > 0) {
        // rAF so the grid has laid out before we scroll against its height.
        requestAnimationFrame(() => window.scrollTo(0, saved.scrollY))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem(STORE_KEY, JSON.stringify({ scrollY: window.scrollY }))
      } catch {
        // ignore
      }
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      window.removeEventListener('scroll', save)
    }
  }, [])

  function markReturning() {
    try {
      sessionStorage.setItem(RETURN_KEY, '1')
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ scrollY: window.scrollY }))
    } catch {
      // ignore
    }
  }

  return <PostTileGrid items={items} hrefKind="savedReel" onTileClick={markReturning} />
}
