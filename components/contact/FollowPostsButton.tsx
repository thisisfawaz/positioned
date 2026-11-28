'use client'

import { useState } from 'react'

// Kept as FollowPostsButton so imports stay stable; the UI calls this a list.
export function FollowPostsButton({
  userId,
  initialFollowing,
  size = 'default',
  onRemoved,
}: {
  userId: string
  initialFollowing: boolean
  size?: 'default' | 'pill'
  onRemoved?: () => void
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [pending, setPending] = useState(false)

  async function toggle() {
    if (pending) return

    // Two-way toggle: POST to add, DELETE to remove.
    const next = !following
    setFollowing(next)
    setPending(true)
    try {
      const res = await fetch(`/api/follow/${userId}`, {
        method: next ? 'POST' : 'DELETE',
      })
      if (!res.ok) setFollowing(!next)
      else if (!next) onRemoved?.()
    } catch {
      setFollowing(!next)
    } finally {
      setPending(false)
    }
  }

  // Fixed width for the pill so 'Add to list' and 'Unlist' occupy the same
  // space (the shorter label used to shrink the button). 'Add to list' is the
  // wider label, so its rendered width is the floor; text is centred.
  const sizing =
    size === 'pill'
      ? 'inline-flex w-auto whitespace-nowrap items-center justify-center px-2.5 py-1 text-[12px] leading-tight'
      : 'px-5 py-2 text-sm'

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={following}
      className={`rounded-md font-semibold transition-colors disabled:cursor-default ${sizing} ${
        following
          ? 'border border-white bg-transparent text-white hover:bg-white/10'
          : 'bg-brand text-white hover:bg-brand-dark disabled:opacity-60'
      }`}
    >
      {following ? 'Unlist' : 'Add to list'}
    </button>
  )
}
