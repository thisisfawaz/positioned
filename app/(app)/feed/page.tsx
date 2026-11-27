'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCached } from '@/lib/client/use-cached'
import { useUser } from '@/lib/client/use-user'
import { ReelFeed } from '@/components/work/ReelFeed'
import { FeedSkeleton } from '@/components/work/FeedSkeleton'
import { WorkComposerModal } from '@/components/work/WorkComposerModal'
import { RecruitmentComposerModal } from '@/components/recruitments/RecruitmentComposerModal'
import { initialsOf } from '@/lib/client/social'
import { DEMO_POSTS } from '@/lib/client/demo-posts'
import { DEMO_POSTS_2 } from '@/lib/client/demo-posts-2'
import {
  subscribePendingPost,
  takePendingPost,
} from '@/lib/client/pending-post'

export default function HomePage() {
  const { user } = useUser()
  const { data } = useCached<{
    workPosts: any[]
    recruitments?: any[]
    followingIds?: string[]
    viewerId?: string
    viewerRole?: 'PROFESSIONAL' | 'RECRUITER' | 'ADMIN' | null
    boostedPostId?: string | null
    pendingRequestByPost?: Record<string, string>
    fulfilledPostIds?: string[]
  }>('/api/home')

  const [composerOpen, setComposerOpen] = useState(false)
  const [preset, setPreset] = useState<string | undefined>(undefined)
  const isRecruiter = user?.role === 'RECRUITER'

  // DEEP LINK FROM EXPLORE. Explore links to `/feed?post=<id>`; the matching
  // card carries that id as a DOM id. We scroll it into view once the feed has
  // data, then stop - otherwise every re-render would yank the user back.
  const searchParams = useSearchParams()
  const deepLinkPostId = searchParams?.get('post') ?? null

  // A post published moments ago. Set by the composer, consumed here once so
  // it appears at the TOP of the feed without waiting for the refetch.
  const [justPublished, setJustPublished] = useState<any | null>(null)
  useEffect(() => {
    const drain = () => {
      const p = takePendingPost()
      if (p) setJustPublished(p)
    }
    drain()
    return subscribePendingPost(drain)
  }, [])

  // A STABLE shuffle seed per mount. Without this the order would re-shuffle
  // on every render (SWR updates, modal toggles), which makes posts jump while
  // the user is scrolling.
  const [shuffleSeed] = useState(() => Math.random())


  const composerPresets: { label: string; value: string }[] = isRecruiter
    ? [
        { label: 'Individual role', value: 'individual' },
        { label: 'Team recruitment', value: 'team' },
      ]
    : [
        { label: 'Project', value: 'PROJECT_SHOWCASE' },
        { label: 'Case study', value: 'CASE_STUDY' },
        { label: 'Achievement', value: 'ACHIEVEMENT' },
        { label: 'Work sample', value: 'WORK_SAMPLE' },
      ]

  const composeLabel = isRecruiter ? 'Share a role…' : 'Show what you are working on…'

  // STATIC DEMO FALLBACK. When there is no live data - the database is
  // unreachable, or the feed is simply empty - show the demo posts so the
  // layout can be judged with realistic volume. These are NOT database rows.
  // Remove this line and the DEMO_POSTS import to go back to live-only.
  const allPosts = data?.workPosts?.length
    ? data.workPosts
    : [...DEMO_POSTS, ...DEMO_POSTS_2]
  const followingIds = data?.followingIds ?? []
  const pendingByPost = data?.pendingRequestByPost ?? {}
  const fulfilledPostIds = new Set(data?.fulfilledPostIds ?? [])

  // RECRUITING POSTS ARE AD-LIKE: they are pulled OUT of the chronological
  // stream and spliced in every AD_INTERVAL professional posts, so scrolling
  // reads as "work, work, work... a recruiter". Detection is by owner, which
  // the API already returns. If there are no recruiter posts, nothing is
  // spliced and the feed is exactly the old chronological list - no gaps.
  const AD_INTERVAL = 5

  const byNewest = (a: any, b: any) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

  // RANDOMISED, but deterministically for this mount: a seeded sort keeps the
  // order stable across re-renders while still differing from a strict
  // newest-first list. Boosted post is still hoisted below.
  const seededRank = (id: string) => {
    let h = 0
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000
    return ((h / 100000 + shuffleSeed) % 1)
  }

  const professionalPosts = allPosts
    .filter((p) => !p.recruiterProfile)
    .sort((a, b) => seededRank(a.id) - seededRank(b.id))
  const recruiterPosts = allPosts.filter((p) => p.recruiterProfile).sort(byNewest)

  const interleaved: any[] = []
  let adCursor = 0
  professionalPosts.forEach((p, i) => {
    interleaved.push(p)
    const isAdSlot = (i + 1) % AD_INTERVAL === 0
    if (isAdSlot && adCursor < recruiterPosts.length) {
      interleaved.push(recruiterPosts[adCursor])
      adCursor += 1
    }
  })

  // NEVER DROP a recruiter post. The interleave only fills every AD_INTERVAL-th
  // professional slot, so when there are fewer professionals than that (or more
  // recruiter posts than slots), the leftovers were silently lost - a newly
  // created recruiter post never reached the feed. Append any that went unused.
  while (adCursor < recruiterPosts.length) {
    interleaved.push(recruiterPosts[adCursor])
    adCursor += 1
  }

  type FeedItem = { kind: 'work'; id: string; createdAt: string; item: any }

  const feed: FeedItem[] = interleaved.map((p) => ({
    kind: 'work' as const,
    id: p.id,
    createdAt: p.createdAt,
    item: p,
  }))

  // JUST-PUBLISHED goes first: the author should see their own post at the top
  // the instant it is created.
  if (justPublished) {
    const rest = feed.filter((f) => f.id !== justPublished.id)
    rest.unshift({
      kind: 'work' as const,
      id: justPublished.id,
      createdAt: justPublished.createdAt ?? new Date().toISOString(),
      item: justPublished,
    })
    feed.length = 0
    feed.push(...rest)
  }

  const boostedPostId = data?.boostedPostId ?? null
  if (boostedPostId) {
    const idx = feed.findIndex((f) => f.kind === 'work' && f.id === boostedPostId)
    if (idx > 0) {
      const [item] = feed.splice(idx, 1)
      feed.unshift(item)
    }
  }

  // The deep-link scroll now lives inside ReelFeed, so it applies to BOTH the
  // global feed and a profile's own reel.

  return (
    <>
    {/* ONE composer for everyone, OUTSIDE both layouts. It is an overlay, so
        putting it inside the desktop-only branch made Create Post dead on
        mobile. */}
    <WorkComposerModal
      open={composerOpen}
      onClose={() => setComposerOpen(false)}
    />

    {/* The reel itself is shared with /[username]/reels - one implementation. */}
    {!data ? (
      <FeedSkeleton />
    ) : (
      <div className="content-fade-in">
      <ReelFeed
        posts={feed}
        viewerId={data?.viewerId}
        viewerRole={data?.viewerRole}
        followingIds={followingIds}
        pendingByPost={pendingByPost}
        fulfilledPostIds={fulfilledPostIds}
        focusPostId={deepLinkPostId}
        emptyMessage="Nothing here yet. Share something you are working on."
      />
      </div>
    )}

    </>
  )
}
