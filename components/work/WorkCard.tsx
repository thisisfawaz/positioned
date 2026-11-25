'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  HeartIcon,
  BookmarkIcon,
  SendIcon,
  MoreIcon,
} from '@/components/icons'
import { relativeTime, initialsOf } from '@/lib/client/social'
import { FollowPostsButton } from '@/components/contact/FollowPostsButton'
import { ContactButton } from '@/components/contact/ContactButton'
import { PostOwnerMenu } from '@/components/work/PostOwnerMenu'
import { responseLabel, type PostSide } from '@/lib/posts/response-types'
import { RequestDocumentsCta } from '@/components/work/RequestDocumentsCta'
import { VideoPlayer, VideoTimeline, type VideoPlayerHandle } from '@/components/work/VideoPlayer'
import type { ResponseType } from '@prisma/client'
import {
  ASPECT_CLASS,
  aspectFromMetadata,
  parseAspect,
  type AspectRatio,
} from '@/lib/posts/aspect'

type Post = {
  id: string
  title: string
  caption?: string | null
  mediaAssets?:
    | {
        id: string
        provider: string
        providerAssetId: string
        metadata?: unknown
      }[]
    | null
  purpose?: string | null
  challenge?: string | null
  goal?: string | null
  approach?: string | null
  solution?: string | null
  contribution?: string | null
  result?: string | null
  metrics?: string | null
  situation?: string | null
  action?: string | null
  skills?: string[]
  links?: string[]
  views: number
  likes?: number
  saves?: number
  createdAt: string | Date
  likedByMe?: boolean
  savedByMe?: boolean
  desiredResponse?: ResponseType | null
  mediaType?: 'IMAGE' | 'YOUTUBE' | 'VIDEO' | null
  videoUrl?: string | null
  applyUrl?: string | null
  professional?: {
    title?: string | null
    location?: string | null
    profilePhoto?: string | null
    user?: { id: string; name: string; email?: string; username?: string | null }
  } | null
  /** A post owned by a recruiter has this instead of `professional`. */
  recruiterProfile?: {
    organization?: string | null
    location?: string | null
    user?: { id: string; name: string; email?: string; username?: string | null }
  } | null
}

/**
 * Feed post as a full-screen reel.
 *
 * The card is a 9:16 portrait frame. On desktop it is sized by HEIGHT (fills
 * the viewport top-to-bottom, width derived from the ratio) and centred, with a
 * visible border so the shape reads as 9:16. On mobile it fills the screen.
 *
 * TWO LAYOUT STATES, toggled by the read-more control:
 *   COLLAPSED (default) - the media fills the WHOLE frame. There is no dark
 *     caption panel. The caption is OVERLAID at the bottom over a soft gradient
 *     (one line + ellipsis) with the CTA already visible.
 *   EXPANDED - the layout becomes a vertical flex column, like a YouTube short:
 *     the media region SHRINKS on top (object-contain, never cropped) and a
 *     solid dark caption panel appears below in normal flow with the full text
 *     and the CTA.
 * The author header is overlaid on the media in both states.
 */

export function WorkCard({
  post,
  viewerId,
  followingIds,
  viewerSide,
  pendingRequestId,
  documentsFulfilled,
  chromeHidden,
}: {
  post: Post
  tint?: string
  viewerId?: string
  followingIds?: string[]
  /** Which side the VIEWER is on - decides the CTA's voice. */
  viewerSide?: 'PROFESSIONAL' | 'RECRUITER' | null
  /** Server-derived: id of a PENDING request the viewer made on this post. */
  pendingRequestId?: string
  /** Server-derived: the request was fulfilled and links exist. */
  documentsFulfilled?: boolean
  /** Mobile: the top/bottom bars are slid away. The overlaid header and
   *  collapsed caption are nudged into the space those bars vacated so they
   *  clear the bars when shown and reclaim the room when hidden. Transform
   *  only (GPU), so it stays smooth with the bars' own slide. */
  chromeHidden?: boolean
}) {
  const prof = post.professional
  const recruiter = post.recruiterProfile

  // ONE post model: the owner is a professional OR a recruiter. Everything
  // below reads `author` / `authorTitle` / `authorPhoto`, so the two owner
  // shapes are normalised here rather than branching throughout the markup.
  const author = prof?.user ?? recruiter?.user ?? null
  const authorTitle = prof?.title ?? recruiter?.organization ?? null
  const authorPhoto = prof?.profilePhoto ?? null
  const name = author?.name || 'Unknown'
  // A SHARED post link opens the HOME FEED at that post. This is deliberately
  // different from a profile's tile, which opens /[username]/reels - sharing
  // hands someone the global feed, not one person's reel.
  const shareHref = `/feed?post=${post.id}`
  const profileHref = `/${author?.username || author?.id || ''}`
  const href = `/${author?.username || author?.id || ''}/work/${post.id}`

  // Recruiter-owned posts read as RECRUITING rather than work: a pill marks
  // them. Detection is by owner, not by response type - a recruiter asking for
  // a Message is still recruiting.
  const isRecruiting = !prof && Boolean(recruiter)

  const [liked, setLiked] = useState(Boolean(post.likedByMe))
  const [saved, setSaved] = useState(Boolean(post.savedByMe))
  // Collapsed = full-bleed media with the caption overlaid.
  // Expanded  = media shrinks, dark caption panel below in normal flow.
  const [expanded, setExpanded] = useState(false)
  // Relative time uses Date.now(); compute after mount so SSR and
  // hydration agree (else "2h" vs "4h" throws a hydration error).
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Desktop has NO fixed top/bottom bars over the reel, so the bar-height
  // offsets (header push-down, caption lift, rail lift) are mobile-only.
  // Track the breakpoint here too so the card can skip them on desktop.
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const apply = () => setIsDesktop(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Handle into the video player so the timeline (rendered in the caption
  // block, above the CTA) can drive playback.
  const playerRef = useRef<VideoPlayerHandle>(null)
  const isVideo = post.mediaType === 'YOUTUBE' && Boolean(post.videoUrl)

  async function toggleLike() {
    const nextLiked = !liked
    setLiked(nextLiked)

    try {
      await fetch(`/api/like/${post.id}`, {
        method: nextLiked ? 'POST' : 'DELETE',
      })
    } catch {
      setLiked(!nextLiked)
    }
  }

  async function toggleSave() {
    const nextSaved = !saved
    setSaved(nextSaved)

    try {
      await fetch(`/api/saved-work/${post.id}`, {
        method: nextSaved ? 'POST' : 'DELETE',
      })
    } catch {
      setSaved(!nextSaved)
    }
  }

  async function send() {
    const url = `${window.location.origin}${shareHref}`
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
    } catch {
      // user dismissed the share sheet
    }
  }

  const media = post.mediaAssets?.[0]
  // The frame this post was filed under. Stored on the asset's metadata (a Json
  // column), so no migration was needed. Missing metadata falls back to 9:16.
  const aspect: AspectRatio = parseAspect(aspectFromMetadata(media?.metadata))
  // providerAssetId holds EITHER a bare local filename (LOCAL provider) OR a
  // full external URL. Prefixing every value with /uploads/ turned external
  // links into `/uploads/https://...`, which 404s - that was the bug that made
  // every externally-hosted image render broken.
  const asset = media?.providerAssetId ?? ''
  const imageUrl = asset
    ? /^https?:\/\//i.test(asset)
      ? asset
      : `/uploads/${asset}`
    : null
  const caption = post.caption || post.result || post.purpose || post.challenge || ''
  // "Read more" only matters when there is actually more than one line. We
  // cannot measure lines without a layout pass, so the toggle is shown whenever
  // the caption is long enough to plausibly wrap. Cheap heuristic: more than a
  // single line's worth of characters.
  const showToggle = caption.length > 60

  // A post with a professional owner was authored on the professional side.
  // Recruiter-owned posts arrive without one. This is INFERRED - the honest
  // fix is for the feed query to return authorSide explicitly.
  const authorSide: PostSide = prof ? 'PROFESSIONAL' : 'RECRUITER'
  const response: ResponseType = post.desiredResponse ?? 'MESSAGE'
  const ctaLabel = responseLabel(response, authorSide, viewerSide ?? 'PROFESSIONAL')

  // Where the CTA goes depends on what is being asked for.
  //   APPLY                          -> the author's application link, new tab.
  //   CV / PORTFOLIO / CV_AND_PORTFOLIO -> a server action (request or submit).
  //   MESSAGE                        -> opens the same contact modal the
  //                                     profile uses. Messaging is ONE path,
  //                                     not a second implementation.
  const isDocResponse =
    response === 'CV' || response === 'PORTFOLIO' || response === 'CV_AND_PORTFOLIO'
  const viewerIsRecruiter = (viewerSide ?? 'PROFESSIONAL') === 'RECRUITER'
  const isDocumentRequest =
    isDocResponse && (authorSide === 'RECRUITER' || viewerIsRecruiter)
  const isApply = response === 'APPLY'
  const isMessage = response === 'MESSAGE'

  // The CTA, shared by BOTH layout states so there is ONE implementation.
  const cta = () => {
    if (!viewerId || !author?.id) return null
    if (author.id === viewerId) {
      // Your own post. The action is shown but inactive: you cannot respond to
      // yourself. A disabled button receives no events, so the explanation
      // lives on the wrapping span, which does.
      return (
        <span className="group relative inline-block">
          <span
            aria-disabled="true"
            className="btn-primary text-sm px-4 py-2 cursor-not-allowed"
          >
            {ctaLabel}
          </span>
          <span className="pointer-events-none absolute bottom-full left-0 mb-1.5 whitespace-nowrap rounded-lg bg-[#1f1f27] px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
            Authors can&apos;t respond to themselves
          </span>
        </span>
      )
    }
    if (isDocumentRequest) {
      return (
        <RequestDocumentsCta
          postId={post.id}
          label={ctaLabel}
          pendingRequestId={pendingRequestId}
          isFulfilled={documentsFulfilled}
          response={response}
          isSupplier={(viewerSide ?? 'PROFESSIONAL') !== authorSide}
        />
      )
    }
    if (isApply && post.applyUrl) {
      return (
        <a
          href={post.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-1.5 text-sm px-4 py-2"
        >
          {ctaLabel}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17L17 7" />
            <path d="M9 7h8v8" />
          </svg>
        </a>
      )
    }
    // A doc-request post the viewer cannot act on (e.g. a professional viewing
    // another professional's CV request) falls back to a plain Message CTA.
    if (isMessage || isDocResponse) {
      return <ContactButton toUserId={author.id} toName={name} workPostId={post.id} />
    }
    return null
  }

  // The media visual, shared by both layout states. `contained` keeps the image
  // object-contain over a blurred copy of itself so nothing is ever cropped.
  const mediaVisual = post.mediaType === 'YOUTUBE' && post.videoUrl ? (
    <VideoPlayer
      ref={playerRef}
      videoUrl={post.videoUrl}
      controlsHidden={!isDesktop && Boolean(chromeHidden)}
    />
  ) : post.mediaType === 'VIDEO' && post.videoUrl ? (
    // An UPLOADED video (Cloudinary). Native element: muted autoplay + loop so
    // the reel behaves like the YouTube player; controls for scrubbing.
    <video
      src={post.videoUrl}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      controls
    />
  ) : imageUrl ? (
    <>
      {/* Blurred fill behind. Always rendered: it is what shows in the gaps
          when the image is NOT close enough to fill the frame. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-60"
      />
      {/* FILL vs CONTAIN. The chosen frame tells us the intended shape; the
          image's own ratio decides whether it may be cropped to reach the
          edges. Within tolerance we use object-cover (fills all four edges,
          trimming a sliver); outside it we use object-contain so nothing is
          lost and the blurred copy shows through.

          The ratio is measured on load rather than stored: metadata carries
          only the CHOSEN frame, and a near-miss is judged against the real
          pixels, not a guess. Until it loads the contained version renders,
          which is the safe default - no crop flashes in. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={post.title}
        data-fit={aspect === '9:16' ? 'cover' : 'contain'}
        className={`absolute inset-0 h-full w-full object-contain transition-none data-[fit=cover]:object-cover`}
      />
    </>
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand via-[#8B5CF6] to-brand-dark">
      <span className="px-6 text-center text-[15px] font-semibold leading-snug text-white">
        {isRecruiting ? caption || post.title : ''}
      </span>
    </div>
  )

  // The author header, overlaid on the media in BOTH states. On MOBILE it is
  // pushed down by the top bar height while the bar is visible (transform
  // only, so it tracks the bar smoothly). DESKTOP has no fixed bar over the
  // reel, so it sits flush at the top edge - the original behaviour.
  const header = (
    <div
      className={`absolute inset-x-0 top-0 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent p-4 ${isDesktop ? '' : 'transition-all duration-200'} ${!isDesktop && chromeHidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      style={{
        transform: isDesktop
          ? undefined
          : chromeHidden
            ? 'translateY(0)'
            : 'translateY(var(--topbar-h))',
      }}
    >
      <div className="flex-shrink-0">
        <Link
          href={profileHref}
          aria-label={`${name}'s profile`}
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/20 text-[14px] font-bold text-white backdrop-blur transition-opacity hover:opacity-85"
        >
          {authorPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={authorPhoto} alt={name} className="h-full w-full object-cover" />
          ) : (
            initialsOf(name)
          )}
        </Link>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={profileHref}
            className="truncate text-[15px] font-semibold text-white hover:underline"
          >
            {name}
          </Link>
          {isRecruiting && (
            <span className="flex-shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
              Recruiting
            </span>
          )}
        </div>
        <p className="truncate text-[12px] text-white/70">
          {[authorTitle, relativeTime(post.createdAt)].filter(Boolean).join(' · ')}
        </p>
      </div>
      {viewerId && author?.id && author.id === viewerId ? (
        <PostOwnerMenu
          postId={post.id}
          initialCaption={post.caption ?? ''}
          initialAspect={aspect}
        />
      ) : viewerId && author?.id && author.id !== viewerId ? (
        <FollowPostsButton
          userId={author.id}
          initialFollowing={followingIds?.includes(author.id) ?? false}
          size="pill"
        />
      ) : null}
    </div>
  )

  // The action rail: horizontal, rendered INLINE beside the CTA.
  // Heart, save, share only - the comment icon was removed.
  const actionRail = (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={liked ? 'Unlike' : 'Like'}
        className={liked ? 'text-rose-500' : 'text-white'}
      >
        <HeartIcon className="h-[22px] w-[22px]" style={liked ? { fill: 'currentColor' } : undefined} />
      </button>
      <button
        onClick={toggleSave}
        aria-pressed={saved}
        aria-label={saved ? 'Unsave' : 'Save'}
        className={saved ? 'text-ink' : 'text-white'}
      >
        <BookmarkIcon className="h-[22px] w-[22px]" style={saved ? { fill: 'currentColor' } : undefined} />
      </button>
      <button onClick={send} aria-label="Share" className="text-white">
        <SendIcon className="h-[22px] w-[22px]" />
      </button>
    </div>
  )

  return (
    <article className="relative flex h-full w-full items-center justify-center bg-black lg:bg-transparent">
      {/* THE FRAME. Desktop: sized by HEIGHT, centred, bordered. The ratio is
          the post's chosen one, not a fixed 9:16 - a landscape post was being
          forced into a portrait frame. `lg:w-auto` + the aspect class lets the
          width follow from the height, so the frame stays height-bound. */}
      <div
        className="relative flex h-full w-full flex-col overflow-hidden lg:mx-auto lg:h-full lg:w-auto lg:aspect-[9/16] lg:rounded-2xl lg:border-2 lg:border-white/25"
      >
        {/* MEDIA REGION. ONE container whose flex ratio ANIMATES between the
            two states, so the media scales smoothly instead of jumping. The
            image is always centred object-contain: as its region shrinks it
            gets smaller in BOTH dimensions, keeping its true ratio. Collapsed
            it takes the whole frame; expanded it settles at ~1/3 of the height
            with the caption panel taking the rest. */}
        <div
          className="relative min-h-0 flex-1 overflow-hidden bg-black transition-all duration-300 ease-out"
        >
          {mediaVisual}
          {header}

          {/* COLLAPSED caption: overlaid at the bottom over a soft gradient.
              Collapses its own height to 0 when expanded so the media region
              can grow/animate cleanly. */}
          <div
            className={`absolute inset-x-0 bottom-0 overflow-hidden bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 text-white transition-all duration-300 ease-out ${
              expanded
                ? 'pointer-events-none h-0 pb-0 pt-0 opacity-0'
                : !isDesktop && chromeHidden
                  ? 'pointer-events-none pb-3 pt-16 opacity-0'
                  : 'pb-3 pt-16 opacity-100'
            }`}
            style={{
              // MOBILE only: lift the collapsed caption above the bottom bar
              // while it is visible; drop back to the edge when it slides away.
              // DESKTOP has no bottom bar over the reel, so keep the plain pb-3.
              paddingBottom: isDesktop
                ? undefined
                : chromeHidden
                  ? undefined
                  : 'calc(0.75rem + var(--bottombar-h))',
            }}
          >
            <div>
              {isVideo && (
                <div className="pb-2">
                  <VideoTimeline playerRef={playerRef} />
                </div>
              )}
              {viewerId && author?.id && (
                <div className="mb-2 flex items-center justify-between gap-3">
                  {cta()}
                  <div className="ml-auto">{actionRail}</div>
                </div>
              )}
              <p className="line-clamp-1 whitespace-pre-wrap text-[14px] leading-relaxed">
                {caption || post.title}
              </p>
              {showToggle && (
                <button
                  onClick={() => setExpanded(true)}
                  className="mt-0.5 text-[12px] font-semibold text-white/80 hover:text-white"
                >
                  … more
                </button>
              )}
            </div>

          </div>
        </div>

        {/* CAPTION PANEL. Grows from 0 to ~2/3 of the frame when expanded, in
            normal flow BELOW the media. Collapsed it is fully collapsed (0
            height, not rendered as a panel), so the media owns the frame. */}
        {/* Content-sized: takes exactly the height its text needs (capped at
            75% so a very long caption scrolls instead of eating the media).
            The media region above is flex-1, so it only shrinks by that much. */}
        <div
          className={`relative max-h-[75%] shrink-0 overflow-hidden bg-[#0b0b10] text-white transition-all duration-300 ease-out ${
            expanded ? 'opacity-100' : 'h-0 opacity-0'
          }`}
        >
          {expanded && (
            <div className="flex h-full flex-col">
              {/* CTA sits ABOVE the text and does NOT scroll, so it is always
                  reachable whether the text needs to scroll or not. */}
              <div className="shrink-0 px-4 pt-3">
                {isVideo && (
                  <div className="pb-2">
                    <VideoTimeline playerRef={playerRef} />
                  </div>
                )}
                {viewerId && author?.id && (
                  <div className="mb-2 flex items-center justify-between gap-3">
                    {cta()}
                    <div className="ml-auto">{actionRail}</div>
                  </div>
                )}
              </div>
              {/* Only the TEXT (and Show less, directly beneath it) scrolls,
                  under the fixed CTA. */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pr-16">
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed">
                  {caption || post.title}
                </p>
                <button
                  onClick={() => setExpanded(false)}
                  className="mt-0.5 text-[12px] font-semibold text-white/70 hover:text-white"
                >
                  Show less
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
