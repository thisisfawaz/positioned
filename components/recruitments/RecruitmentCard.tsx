'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  HeartIcon,
  ShareIcon,
  EyeIcon,
  BookmarkIcon,
} from '@/components/icons'
import { relativeTime, initialsOf, compactCount } from '@/lib/client/social'
import { FollowPostsButton } from '@/components/contact/FollowPostsButton'
import { ApplyAction } from '@/components/recruitments/ApplyAction'

/**
 * Stored videoUrl is a bare embed URL (https://www.youtube.com/embed/ID).
 * Turn it into a muted autoplay + loop embed. YouTube only autoplays when
 * muted, and looping requires the video id repeated in `playlist`.
 */
function autoplayEmbedUrl(url: string): string {
  const id = url.match(/embed\/([\w-]{11})/)?.[1]
  const base = id ? `https://www.youtube.com/embed/${id}` : url.split('?')[0]
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    playsinline: '1',
    loop: '1',
    modestbranding: '1',
    rel: '0',
  })
  if (id) params.set('playlist', id)
  return `${base}?${params.toString()}`
}

type Recruitment = {
  id: string
  title: string
  organization: string | null
  location: string | null
  employmentType: string | null
  description: string | null
  responsibilities: string | null
  requirements: string | null
  salaryRange: string | null
  salaryHidden?: boolean
  applyMethod?: string
  applyInstructions?: string | null
  closingDate: string | null
  applyUrl: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  mediaType?: string | null
  views: number
  likes: number
  shares: number
  saves: number
  likedByMe?: boolean
  savedByMe?: boolean
  createdAt: string | Date
  recruiter?: { id?: string; name: string; username?: string | null }
}

export function RecruitmentCard({
  recruitment,
  tint = '',
  viewerId,
  followingIds,
}: {
  recruitment: Recruitment
  tint?: string
  viewerId?: string
  followingIds?: string[]
}) {
  const r = recruitment
  const authorName = r.recruiter?.name || 'Recruiter'
  const handle = r.recruiter?.username ? `@${r.recruiter.username}` : ''

  const [liked, setLiked] = useState(Boolean(r.likedByMe))
  const [likeCount, setLikeCount] = useState(r.likes ?? 0)
  const [saved, setSaved] = useState(Boolean(r.savedByMe))
  const [savedCount, setSavedCount] = useState(r.saves ?? 0)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [viewCount, setViewCount] = useState(r.views ?? 0)
  const [viewed, setViewed] = useState(false)

  const sections = [
    { label: 'Description', value: r.description },
    { label: 'Responsibilities', value: r.responsibilities },
    { label: 'Requirements', value: r.requirements },
    { label: 'How to apply', value: r.applyInstructions },
    { label: 'Salary', value: r.salaryRange },
    { label: 'Closing date', value: r.closingDate },
  ].filter((s) => s.value && s.value.trim().length > 0)

  const [synced, setSynced] = useState(false)
  useEffect(() => {
    if (!synced && r.likedByMe !== undefined) {
      setLiked(Boolean(r.likedByMe))
      setLikeCount(r.likes ?? 0)
      setSynced(true)
    }
  }, [r.likedByMe, r.likes, synced])

  async function toggleLike() {
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)))

    try {
      await fetch(`/api/recruitment-like/${r.id}`, {
        method: nextLiked ? 'POST' : 'DELETE',
      })
    } catch {
      setLiked(!nextLiked)
      setLikeCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)))
    }
  }

  async function toggleSave() {
    const nextSaved = !saved
    setSaved(nextSaved)
    setSavedCount((c) => Math.max(0, c + (nextSaved ? 1 : -1)))

    try {
      await fetch(`/api/saved-recruitment/${r.id}`, {
        method: nextSaved ? 'POST' : 'DELETE',
      })
    } catch {
      setSaved(!nextSaved)
      setSavedCount((c) => Math.max(0, c + (nextSaved ? -1 : 1)))
    }
  }

  async function share() {
    const url = `${window.location.origin}/${r.recruiter?.username || r.recruiter?.id || ''}/recruitments/${r.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: r.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // dismissed
    }
  }

  return (
    <article className={`feed-post ${tint}`}>
      <div className="flex items-start gap-3">
        <Link
          href={`/${r.recruiter?.username || r.recruiter?.id || ''}`}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-light text-[15px] font-bold text-ink"
        >
          {initialsOf(authorName)}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex flex-1 items-baseline gap-1.5 text-[15px] flex-wrap min-w-0">
            <Link
              href={`/${r.recruiter?.username || r.recruiter?.id || ''}`}
              className="font-semibold text-ink truncate"
            >
              {authorName}
            </Link>
            <span className="text-ink-subtle">·</span>
            <time className="text-ink-subtle" dateTime={typeof r.createdAt === 'string' ? r.createdAt : r.createdAt.toISOString()}>
              {relativeTime(r.createdAt)}
            </time>
            <span className="ml-1 rounded-md bg-brand-light px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-ink">
              HIRING
            </span>
            </div>
            {viewerId && r.recruiter?.id && r.recruiter.id !== viewerId && (
              <FollowPostsButton
                userId={r.recruiter.id}
                initialFollowing={followingIds?.includes(r.recruiter.id) ?? false}
                size="pill"
              />
            )}
          </div>
          {handle && (
            <Link
              href={`/${r.recruiter?.username || r.recruiter?.id || ''}`}
              className="block text-[14px] text-ink-subtle truncate hover:underline"
            >
              {handle}
            </Link>
          )}

          {/* MEDIA - an image or a YouTube embed, above the title. Added
              2026-11-17; recruitment posts previously had no media at all. */}
          {r.mediaType === 'YOUTUBE' && r.videoUrl ? (
            <div className="mt-2 overflow-hidden rounded-xl bg-black">
              <iframe
                src={autoplayEmbedUrl(r.videoUrl)}
                title={r.title}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : r.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.imageUrl}
              alt={r.title}
              className="mt-2 aspect-[4/3] w-full rounded-xl object-cover"
            />
          ) : null}

          <Link href={`/${r.recruiter?.username || r.recruiter?.id || ''}/recruitments/${r.id}`} className="block group">
            <h3 className="mt-1.5 text-[17px] font-semibold leading-snug text-ink group-hover:underline">
              {r.title}
            </h3>
            <p className="mt-1.5 text-[14px] font-medium text-ink">
              {[r.organization, r.location, r.employmentType].filter(Boolean).join(' · ')}
            </p>
            {expanded ? (
              <div className="mt-1 space-y-2">
                {sections.map((s) => (
                  <div key={s.label}>
                    <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-ink-subtle">{s.label}</h2>
                    <p className="text-[15px] text-ink whitespace-pre-wrap">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              r.description && (
                <p className="mt-1 text-[15px] text-ink leading-relaxed line-clamp-2">
                  {r.description}
                </p>
              )
            )}
          </Link>

          {sections.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const next = !expanded
                  setExpanded(next)
                  if (next && !viewed) {
                    setViewed(true)
                    fetch(`/api/recruitment-view/${r.id}`, { method: 'POST' })
                      .then((res) => res.json())
                      .then((d) => {
                        if (typeof d?.views === 'number') setViewCount(d.views)
                      })
                      .catch(() => {})
                  }
                }}
                className="mt-1.5 text-[14px] font-semibold text-ink hover:underline"
              >
                {expanded ? 'see less' : 'see more'}
              </button>
            )}

          {r.applyInstructions && !expanded && (
            <p className="mt-2 text-[15px] text-ink whitespace-pre-wrap line-clamp-2">
              {r.applyInstructions}
            </p>
          )}

          <div className="mt-3">
            <ApplyAction recruitment={r} />
          </div>

          <div className="feed-actions">
            <button
              onClick={toggleLike}
              aria-pressed={liked}
              aria-label={liked ? 'Unlike' : 'Like'}
              className={`feed-action ${liked ? 'feed-action-liked' : ''}`}
            >
              <HeartIcon
                className="w-[18px] h-[18px]"
                style={liked ? { fill: 'currentColor' } : undefined}
              />
              <span>{likeCount > 0 ? compactCount(likeCount) : 'Like'}</span>
            </button>

            <button onClick={share} className="feed-action" aria-label="Share">
              <ShareIcon className="w-[18px] h-[18px]" />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <Link
              href={`/${r.recruiter?.username || r.recruiter?.id || ''}/recruitments/${r.id}`}
              className="feed-action"
              aria-label="Views"
            >
              <EyeIcon className="w-[18px] h-[18px]" />
              <span>{compactCount(viewCount)}</span>
            </Link>

            <button
              onClick={toggleSave}
              aria-pressed={saved}
              aria-label={saved ? 'Unsave' : 'Save'}
              className={`feed-action ml-auto ${saved ? 'text-ink' : ''}`}
            >
              <BookmarkIcon
                className="w-[18px] h-[18px]"
                style={saved ? { fill: 'currentColor' } : undefined}
              />
              <span>{savedCount > 0 ? compactCount(savedCount) : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
