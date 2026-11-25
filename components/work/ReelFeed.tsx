'use client'

import { useEffect, useRef, useState } from 'react'
import { WorkCard } from '@/components/work/WorkCard'
import { emitReelScroll } from '@/lib/client/reel-scroll'

/**
 * The full-screen snap reel. Used by the global feed AND by a profile's scoped
 * reel at `/[username]/reels`, so the two cannot drift apart.
 *
 * Native CSS scroll-snap with `scroll-snap-stop: always` on every card. That
 * property forces the scroller to stop at EACH snap point during a fling, so a
 * hard speed-swipe can only ever advance one post — without any JS clamping,
 * timers, or momentum fighting.
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
  // Mirror of the chrome state so a tap can toggle it. Kept in a ref because
  // the tap handler is attached once and must read the latest value.
  const barsHidden = useRef(false)
  // Mirrored into state so the container can GROW to the full viewport while
  // the bars are slid away, and shrink back to the between-the-bars box when
  // they return. The ref stays for the tap handler; this drives rendering.
  const [chromeHidden, setChromeHidden] = useState(false)
  // Distinguish a tap (toggle chrome) from a drag (scroll).
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  // After the user stays on a post for 3s (no scrolling), auto-hide the mobile
  // chrome so the post is seen in full. Any scroll cancels/restarts this and
  // normal scroll-driven reveal takes back over.
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDesktopRef = useRef(false)

  const clearIdle = () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
      idleTimer.current = null
    }
  }

  // Chrome now hides ONLY on an explicit tap. The old 3s idle auto-hide is
  // disabled so a scrolled-to post keeps its header/caption until tapped.
  const armIdle = () => {
    clearIdle()
  }

  /** Step exactly one card up or down. Native snap snaps the rest. */
  const scrollByCard = (dir: 1 | -1) => {
    const container = scrollRef.current
    if (!container) return
    const h = container.clientHeight
    const target = Math.max(
      0,
      Math.min(
        (posts.length - 1) * h,
        Math.round(container.scrollTop / h) * h + dir * h
      )
    )
    container.scrollTo({ top: target, behavior: 'smooth' })
  }

  useEffect(() => {
    if (focusDone || !focusPostId || posts.length === 0) return
    const el = document.getElementById(`post-${focusPostId}`)
    if (el) {
      el.scrollIntoView({ block: 'start' })
      setFocusDone(true)
    }
  }, [focusPostId, focusDone, posts.length])

  // The reel scrolls inside its own container, so window.scrollY never moves.
  // Report direction to the mobile top bar via a custom event so it hides on
  // downward scroll and reveals on upward scroll - same feel as page scroll.
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    let lastTop = container.scrollTop
    // Which card index the chrome was last revealed for. Landing on a
    // DIFFERENT card re-shows the chrome/overlays (until the next tap).
    let lastCardIndex = Math.round(container.scrollTop / Math.max(1, container.clientHeight))

    const onScroll = () => {
      const top = container.scrollTop
      lastTop = top

      // Near the very top, always show.
      if (top < 8) {
        if (barsHidden.current) {
          barsHidden.current = false
          setChromeHidden(false)
          emitReelScroll(false)
        }
        return
      }

      // Scrolling to a DIFFERENT card reveals the chrome again. Scrolling
      // never HIDES it - only a tap does.
      const h = Math.max(1, container.clientHeight)
      const cardIndex = Math.round(top / h)
      if (cardIndex !== lastCardIndex) {
        lastCardIndex = cardIndex
        if (barsHidden.current) {
          barsHidden.current = false
          setChromeHidden(false)
          emitReelScroll(false)
        }
      }
    }

    container.addEventListener('scroll', onScroll, { passive: true })

    // Start the idle countdown on mount so simply LOOKING at the first post
    // (without touching it) also hides the bars after 3s.
    armIdle()

    // Tap-to-reveal: a tap that is NOT a drag and NOT on a control toggles the
    // chrome. This is the standard reels behaviour so users who stopped
    // scrolling can still reach the nav.
    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const onTouchEnd = (e: TouchEvent) => {
      const start = touchStart.current
      touchStart.current = null
      if (!start) return
      const dx = Math.abs((e.changedTouches[0]?.clientX ?? start.x) - start.x)
      const dy = Math.abs((e.changedTouches[0]?.clientY ?? start.y) - start.y)
      // A drag, not a tap - scrolling owns this.
      if (dx > 10 || dy > 10) return
      // Let controls (links/buttons) handle their own taps.
      const target = e.target as Element | null
      if (target?.closest('a, button, input, textarea, select, [role="button"]')) return
      barsHidden.current = !barsHidden.current
      setChromeHidden(barsHidden.current)
      emitReelScroll(barsHidden.current)
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      clearIdle()
      // Leaving the reel must restore the mobile bars. This component emits
      // hidden=true while scrolling and nothing else ever emits false, so
      // without this the next page mounted with the bars already gone.
      barsHidden.current = false
      emitReelScroll(false)
      container.removeEventListener('scroll', onScroll)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend', onTouchEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const viewerSide =
    viewerRole === 'RECRUITER'
      ? 'RECRUITER'
      : viewerRole === 'PROFESSIONAL'
        ? 'PROFESSIONAL'
        : null

  // MOBILE: the frame is a CONSTANT full-screen fixed box (inset: 0) sitting
  // behind both bars. Hiding the bars only slides their transforms away and
  // reveals frame that was already there - so the reveal is perfectly smooth.
  //
  // The earlier version animated `top`/`bottom` between two sizes, which forces
  // layout + paint of a container holding a YouTube iframe and snap cards on
  // every frame. That is what looked janky as the bars returned. Transform-only
  // motion (the bars) stays on the GPU; this frame never resizes at all.
  //
  // The bars OVERLAY the card, which is the standard full-bleed reel look
  // (TikTok/Reels); the card's caption/CTA already respect safe areas.
  //
  // DESKTOP: gated to normal flow in JS (not `lg:` classes) because inline
  // styles beat classes and a `lg:` override could not undo `position: fixed`.
  // There the reel keeps its 9:16 height-bound sizing.
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const apply = () => {
      setIsDesktop(mq.matches)
      isDesktopRef.current = mq.matches
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const frameStyle: React.CSSProperties = isDesktop
    ? {
        width: '100%',
        // <main> is a content-height flex item (lg:pt-0/lg:pb-0), so the reel
        // must supply its own height. Without this the inner `h-full` scroller
        // and the `h-full` cards resolve against auto height and collapse.
        height: '100dvh',
      }
    : {
        position: 'fixed',
        inset: 0,
        zIndex: 10,
      }

  return (
    <div className="relative lg:static" style={frameStyle}>
      <div
        ref={scrollRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
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
              className="h-full w-full snap-start overflow-hidden [scroll-snap-stop:always]"
            >
              <WorkCard
                post={entry.item}
                viewerId={viewerId}
                followingIds={followingIds}
                viewerSide={viewerSide}
                pendingRequestId={pendingByPost?.[entry.id]}
                documentsFulfilled={fulfilledPostIds?.has(entry.id)}
                chromeHidden={chromeHidden}
              />
            </div>
          ))
        )}
      </div>

      {/* Up/down arrows sit just OUTSIDE the card frame's right edge, beside
          its vertical middle. The frame is centred and height-bound, so a
          centred box of the SAME width and height aligns with it exactly; the
          buttons hang off that box's right edge. Anchoring to the wrapper
          (now `relative`) keeps this correct regardless of the sidebar width
          on desktop - viewport math did not. Hidden on mobile. */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
        <div className="pointer-events-none relative h-full aspect-[9/16]">
          <div className="pointer-events-none absolute inset-y-0 -right-[86px] flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Previous post"
          onClick={() => scrollByCard(-1)}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/80 text-ink backdrop-blur transition hover:bg-surface"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next post"
          onClick={() => scrollByCard(1)}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/80 text-ink backdrop-blur transition hover:bg-surface"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
          </div>
        </div>
      </div>
    </div>
  )
}
