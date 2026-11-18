'use client'

import { useEffect, useRef, useState } from 'react'
import { WorkCard } from '@/components/work/WorkCard'

/**
 * The full-screen snap reel. Used by the global feed AND by a profile's scoped
 * reel at `/[username]/reels`, so the two cannot drift apart.
 *
 * MOBILE subtracts the top bar (56px) and bottom nav (64px); DESKTOP has
 * neither, so it is the full viewport height. One card per screen.
 *
 * `focusPostId` scrolls a specific card into view ONCE, which is how a deep
 * link opens on the right post without fighting the user's later scrolling.
 */
export function ReelFeed({
  posts,
  viewerId,
  viewerRole,
  followingIds,
  pendingByPost,
  fulfilledPostIds,
  focusPostId,
  emptyMessage = 'Nothing here yet. Share something you are working on.',
}: {
  posts: any[]
  viewerId?: string
  viewerRole?: 'PROFESSIONAL' | 'RECRUITER' | 'ADMIN' | null
  followingIds?: string[]
  pendingByPost?: Record<string, string>
  fulfilledPostIds?: Set<string>
  focusPostId?: string | null
  emptyMessage?: string
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [focusDone, setFocusDone] = useState(false)

  useEffect(() => {
    if (focusDone || !focusPostId || posts.length === 0) return
    const el = document.getElementById(`post-${focusPostId}`)
    if (el) {
      el.scrollIntoView({ block: 'start' })
      setFocusDone(true)
    }
  }, [focusPostId, focusDone, posts.length])

  const viewerSide =
    viewerRole === 'RECRUITER'
      ? 'RECRUITER'
      : viewerRole === 'PROFESSIONAL'
        ? 'PROFESSIONAL'
        : null

  return (
    <div
      ref={scrollRef}
      className="h-[calc(100dvh-56px-64px)] w-full snap-y snap-mandatory overflow-y-auto overscroll-contain lg:h-[100dvh]"
    >
      {posts.length === 0 ? (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <p className="text-[14px] text-ink-subtle">{emptyMessage}</p>
        </div>
      ) : (
        posts.map((entry) => (
          <div
            key={entry.id}
            id={`post-${entry.id}`}
            className="h-full w-full snap-start overflow-hidden"
          >
            <WorkCard
              post={entry.item}
              viewerId={viewerId}
              followingIds={followingIds}
              viewerSide={viewerSide}
              pendingRequestId={pendingByPost?.[entry.id]}
              documentsFulfilled={fulfilledPostIds?.has(entry.id)}
            />
          </div>
        ))
      )}
    </div>
  )
}
