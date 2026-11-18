'use client'

import { useState } from 'react'
import Link from 'next/link'
import { initialsOf } from '@/lib/client/social'
import { FollowPostsButton } from '@/components/contact/FollowPostsButton'

export function ListRow({
  userId,
  handle,
  name,
  username,
  subtitle,
  photo,
}: {
  userId: string
  handle: string
  name: string
  username: string | null
  subtitle: string
  photo: string | null
}) {
  const [removed, setRemoved] = useState(false)
  if (removed) return null

  return (
    <li>
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 transition-colors hover:bg-surface-sunken">
        <Link href={`/${handle}`} className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-[15px] font-semibold text-ink">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={name} className="h-full w-full object-cover" />
            ) : (
              initialsOf(name)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">{name}</p>
            {username && (
              <p className="truncate text-[13px] text-ink-subtle">@{username}</p>
            )}
            {subtitle && (
              <p className="truncate text-[13px] text-ink-muted">{subtitle}</p>
            )}
          </div>
        </Link>
        <div className="ml-auto flex-shrink-0">
          <FollowPostsButton
            userId={userId}
            initialFollowing
            size="pill"
            onRemoved={() => setRemoved(true)}
          />
        </div>
      </div>
    </li>
  )
}
