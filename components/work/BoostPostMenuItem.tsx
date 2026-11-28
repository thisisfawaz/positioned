'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { togglePremiumBoostPost } from '@/app/(app)/profile/visibility/actions'

type State = { premium: boolean; boosted: boolean; slotsUsed: number; slotsMax: number }

// Module-level cache keyed by postId. Survives menu close/reopen, so the second
// open is instant instead of waiting on a fetch. Invalidated for a post right
// after a toggle so the value stays correct.
const cache = new Map<string, State>()

async function loadState(postId: string): Promise<State | null> {
  try {
    const r = await fetch(`/api/boost/post-state?postId=${encodeURIComponent(postId)}`)
    if (!r.ok) return null
    const s = (await r.json()) as State
    cache.set(postId, s)
    return s
  } catch {
    return null
  }
}

/**
 * Boost / Unboost entry for the owner's post menu.
 *
 * Instant by design:
 *   - The cached value (if any) renders immediately on open.
 *   - The button is never disabled merely because data is loading, so it can
 *     be tapped right away; a tap optimistically flips the label.
 *   - A toggle updates the cache optimistically, so reopening shows the new
 *     label with no fetch lag.
 */
export function BoostPostMenuItem({
  postId,
  onDone,
  onError,
  onInfo,
}: {
  postId: string
  onDone: () => void
  onError: (msg: string) => void
  onInfo: (msg: string) => void
}) {
  const [state, setState] = useState<State | null>(() => cache.get(postId) ?? null)
  const [pending, start] = useTransition()
  const router = useRouter()

  useEffect(() => {
    let alive = true
    // If we already have a cached value, don't refetch on mount - that is the
    // whole point of the cache. Only fetch when we have nothing to show.
    if (cache.has(postId)) return
    loadState(postId).then((s) => {
      if (alive && s) setState(s)
    })
    return () => {
      alive = false
    }
  }, [postId])

  // No hard-disabled loading state: without data we optimistically treat it as
  // a boostable, non-premium-unknown post and let the server be the authority
  // on click. This removes the wait before it becomes clickable.
  const premium = state?.premium ?? true
  const boosted = state?.boosted ?? false
  const slotsUsed = state?.slotsUsed ?? 0
  const slotsMax = state?.slotsMax ?? 4
  const full = slotsUsed >= slotsMax && !boosted
  const disabled = !premium || full

  const onClick = () => {
    if (disabled || pending) return

    // Optimistic flip so the label and cache update immediately.
    const nextBoosted = !boosted
    const optimistic: State = {
      premium: true,
      boosted: nextBoosted,
      slotsUsed: Math.max(0, slotsUsed + (nextBoosted ? 1 : -1)),
      slotsMax,
    }
    setState(optimistic)
    cache.set(postId, optimistic)
    onDone()

    start(async () => {
      const res: any = await togglePremiumBoostPost(postId)
      if (res?.error) {
        // Roll back to the previous value on failure.
        if (state) {
          setState(state)
          cache.set(postId, state)
        } else {
          cache.delete(postId)
        }
        const msg =
          res.error === 'premium_required'
            ? 'Boosting is part of Premium.'
            : res.error === 'slots_full'
              ? 'All boost slots are full. Unboost a post first.'
              : res.error === 'not_signed_in'
                ? 'Please sign in again.'
                : res.error === 'not_professional'
                  ? 'Boosting is only available to professional accounts.'
                  : 'Could not update the boost. Please try again.'
        onError(msg)
      } else {
        onInfo(nextBoosted ? 'Added to boost' : 'Removed from boost')
        router.refresh()
      }
    })
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled || pending}
      title={!premium ? 'Boosting is part of Premium' : full ? 'All boost slots are full' : undefined}
      className={`block w-full px-3 py-2 text-left text-[13px] ${
        disabled ? 'cursor-default text-ink-subtle opacity-60' : 'text-ink hover:bg-surface-sunken'
      }`}
    >
      {boosted ? 'Unboost' : 'Boost'}
    </button>
  )
}
