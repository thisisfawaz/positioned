'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ExperienceSection } from '@/components/profile/ExperienceSection'
import { AboutSection } from '@/components/profile/AboutSection'
import { youtubeVideoId } from '@/lib/client/youtube'

type Post = {
  id: string
  title: string
  mediaType?: 'IMAGE' | 'YOUTUBE' | 'VIDEO' | null
  videoUrl?: string | null
  mediaAssets?: { providerAssetId: string }[] | null
}

const PAGE = 9

/**
 * Profile content tabs: Published | Experience.
 *
 * PUBLISHED is a 9-across-at-a-time tile grid that loads more as the user
 * scrolls to the bottom - no separate "all posts" page and no pager. Tiles
 * open the post IN THE FEED (`/feed?post=<id>`), which is the one place a post
 * opens as a reel.
 *
 * Everything is already loaded from the server; the scroll only REVEALS more,
 * so there is no extra request and no loading state to get wrong.
 */
export function ProfilePosts({
  posts,
  experiences,
  about,
  links = [],
  handle,
  isOwn,
  isRecruiter,
  roles,
  contactEmail,
  contactName,
}: {
  posts: Post[]
  experiences?: any[] | null
  about?: string | null
  links?: { label: string; url: string }[]
  handle: string
  isOwn: boolean
  isRecruiter: boolean
  roles: any[]
  contactEmail?: string | null
  contactName?: string | null
}) {
  const STORE_KEY = `profile:${handle}`

  // Restore the revealed count BEFORE first paint so the page is already tall
  // enough for the browser's scroll restoration to land in the right place.
  // Without this, coming back from a post resets to 9 tiles, the page is short,
  // and the restored scroll offset is clamped to the bottom of a shorter page.
  const [tab, setTab] = useState<'published' | 'about' | 'experience' | 'links' | 'contact'>(() => {
    if (typeof window === 'undefined') return 'published'
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}')
      return saved.tab === 'experience'
        ? 'experience'
        : saved.tab === 'about'
          ? 'about'
          : saved.tab === 'links'
            ? 'links'
            : saved.tab === 'contact'
              ? 'contact'
              : 'published'
    } catch {
      return 'published'
    }
  })
  // The revealed count is restored ONLY when returning from a post, never on a
  // FRESH visit. A fresh visit must always start at exactly PAGE (9) and load
  // more on scroll - otherwise a profile with 10 posts showed all 10 at once,
  // because a stale stored count was being restored.
  //
  // `returning` is written to sessionStorage the moment a tile is clicked and
  // consumed (deleted) once the count has been read, so it cannot leak into a
  // later fresh visit.
  const RETURN_KEY = `${STORE_KEY}:returning`

  // Read the return flag ONCE, before anything consumes it. It decides BOTH the
  // starting tile count and whether the scroll offset is re-applied.
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

  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined' || !returning) return PAGE
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}')
      return typeof saved.visible === 'number' ? Math.max(PAGE, saved.visible) : PAGE
    } catch {
      return PAGE
    }
  })
  const sentinel = useRef<HTMLDivElement | null>(null)

  // Remember the revealed count and the active tab. The `returning` flag is set
  // on the TILE CLICK below, not here, so this record alone never triggers a
  // restore on a fresh visit.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ visible, tab }))
    } catch {
      // storage disabled - the page still works, it just will not remember
    }
  }, [STORE_KEY, visible, tab])

  // Called when a tile is clicked, immediately before navigating away.
  function markReturning() {
    try {
      sessionStorage.setItem(RETURN_KEY, '1')
    } catch {
      // ignore
    }
  }

  // Re-assert the scroll position AFTER the restored tile count has rendered.
  // The browser's own restoration happens against the taller page we now have,
  // but this covers the case where it ran before our restore.
  // Only re-assert on a RETURNING visit. A fresh visit must start at the top,
  // so a stale offset is not applied.
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

  // Keep the current scroll offset with the same record. Saved on scroll
  // (passive) and again on unmount, which is what runs when the user taps a
  // post and leaves.
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

  // LOAD-MORE ONLY ON A REAL SCROLL. A plain observer fires at mount whenever
  // the sentinel is already near the viewport, which loaded a second batch
  // before the user had scrolled at all. `hasScrolled` gates that: the sentinel
  // has to be reached by an actual scroll gesture. The margin is also tighter
  // (50px, not 200) so "near the bottom" means near the bottom.
  const hasScrolled = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) hasScrolled.current = true
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasScrolled.current) {
          setVisible((v) => Math.min(v + PAGE, posts.length))
        }
      },
      { rootMargin: '50px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [posts.length, visible])

  const shown = posts.slice(0, visible)

  const tabClass = (active: boolean) =>
    `relative inline-block py-3 text-[14px] font-semibold ${
      active ? 'text-ink' : 'text-ink-subtle hover:text-ink'
    }`

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-5 border-b border-line px-4">
        <button type="button" onClick={() => setTab('published')} className={tabClass(tab === 'published')}>
          Posts
          {tab === 'published' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-brand" />
          )}
        </button>
        <button type="button" onClick={() => setTab('about')} className={tabClass(tab === 'about')}>
          About
          {tab === 'about' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-brand" />
          )}
        </button>
        <button type="button" onClick={() => setTab('experience')} className={tabClass(tab === 'experience')}>
          Experience
          {tab === 'experience' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-brand" />
          )}
        </button>
        <button type="button" onClick={() => setTab('links')} className={tabClass(tab === 'links')}>
          Links
          {tab === 'links' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-brand" />
          )}
        </button>
        <button type="button" onClick={() => setTab('contact')} className={tabClass(tab === 'contact')}>
          Contact
          {tab === 'contact' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-brand" />
          )}
        </button>
      </div>

      {tab === 'contact' ? (
        contactEmail ? (
          <div className="px-4 py-6">
            <p className="text-[13px] text-ink-subtle">Get in touch with {contactName || 'this person'}.</p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {contactEmail}
            </a>
          </div>
        ) : (
          <div className="px-6 py-16 text-center text-[14px] text-ink-subtle">
            No contact email added yet.
          </div>
        )
      ) : tab === 'links' ? (
        links.length > 0 ? (
          <ul className="divide-y divide-line">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 text-[14px] font-semibold text-ink hover:bg-surface-sunken"
                >
                  {l.label}
                  <span className="text-ink-subtle">↗</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-16 text-center text-[14px] text-ink-subtle">
            No links added yet.
          </div>
        )
      ) : tab === 'about' ? (
        about ? (
          <div className="px-4 py-4">
            <AboutSection text={about} />
          </div>
        ) : (
          <div className="px-6 py-16 text-center text-[14px] text-ink-subtle">
            No about added yet.
          </div>
        )
      ) : tab === 'experience' ? (
        experiences && experiences.length > 0 ? (
          <ExperienceSection experiences={experiences} />
        ) : (
          <div className="px-6 py-16 text-center text-[14px] text-ink-subtle">
            No experience added yet.
          </div>
        )
      ) : posts.length === 0 ? (
        <div className="px-6 py-16 text-center text-[14px] text-ink-subtle">
          {isOwn ? "You haven't posted any work yet." : 'No work posted yet.'}
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-3 gap-[2px] p-0 sm:gap-1 sm:p-1">
            {shown.map((post) => {
              const asset = post.mediaAssets?.[0]?.providerAssetId
              const imageSrc = asset
                ? asset.startsWith('http://') || asset.startsWith('https://')
                  ? asset
                  : `/uploads/${asset}`
                : null
              // A YouTube post has no media asset - its video lives on
              // videoUrl. Use YouTube's own poster frame so the tile shows a
              // real thumbnail instead of falling back to a title-only block.
              const ytId =
                post.mediaType === 'YOUTUBE' ? youtubeVideoId(post.videoUrl) : null
              const src = imageSrc ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null)
              const isVideo = Boolean(ytId) || post.mediaType === 'VIDEO'
              return (
                <li key={post.id}>
                  {/* Opens this profile's OWN reel - /[username]/reels -
                      starting at the clicked post. */}
                  <Link
                    href={`/${handle}/reels?post=${post.id}`}
                    onClick={markReturning}
                    className="group relative block aspect-square overflow-hidden bg-surface-sunken"
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-light to-surface-sunken p-2 text-center text-[11px] font-semibold leading-tight text-ink">
                        {post.title}
                      </div>
                    )}
                    {isVideo && src && (
                      <span className="pointer-events-none absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
          {visible < posts.length && <div ref={sentinel} className="h-8" />}
        </>
      )}
    </div>
  )
}
