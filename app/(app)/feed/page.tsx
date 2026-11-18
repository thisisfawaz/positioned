'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCached } from '@/lib/client/use-cached'
import { useUser } from '@/lib/client/use-user'
import { ReelFeed } from '@/components/work/ReelFeed'
import { Skeleton } from '@/components/ui/Skeleton'
import { WorkComposerModal } from '@/components/work/WorkComposerModal'
import { RecruitmentComposerModal } from '@/components/recruitments/RecruitmentComposerModal'
import { initialsOf } from '@/lib/client/social'
import { DEMO_POSTS } from '@/lib/client/demo-posts'
import { DEMO_POSTS_2 } from '@/lib/client/demo-posts-2'

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

  const professionalPosts = allPosts
    .filter((p) => !p.recruiterProfile)
    .sort(byNewest)
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

  type FeedItem = { kind: 'work'; id: string; createdAt: string; item: any }

  const feed: FeedItem[] = interleaved.map((p) => ({
    kind: 'work' as const,
    id: p.id,
    createdAt: p.createdAt,
    item: p,
  }))

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
    <ReelFeed
      posts={feed}
      viewerId={data?.viewerId}
      viewerRole={data?.viewerRole}
      followingIds={followingIds}
      pendingByPost={pendingByPost}
      fulfilledPostIds={fulfilledPostIds}
      focusPostId={deepLinkPostId}
      emptyMessage={!data ? 'Loading…' : 'Nothing here yet. Share something you are working on.'}
    />

    </>
  )
}
