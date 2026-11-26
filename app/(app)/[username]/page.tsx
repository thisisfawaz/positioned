'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { useCached } from '@/lib/client/use-cached'
import { ProfileBody } from '@/components/profile/ProfileBody'
import { Skeleton } from '@/components/ui/Skeleton'

type ProfileResponse = {
  user: { id: string; name: string; username: string | null }
  prof: any
  recruiter: any
  isRecruiter: boolean
  isOwn: boolean
  onList: boolean
  posts: any[]
  roles: any[]
  canFollow: boolean
  viewerPremiumBlocked?: boolean
}

function ProfileSkeleton() {
  // Mirrors the CURRENT ProfileBody layout: avatar LEFT with name/handle/bio to
  // its RIGHT, action buttons, meta row, the Posts | About | Experience tab bar,
  // then a 3-column square tile grid. Kept in sync with loading.tsx so the page
  // never morphs from a different shape into the real one when data arrives.
  return (
    <div className="mx-auto w-full max-w-[980px] overflow-hidden bg-white lg:rounded-2xl">
      <div className="px-0 pb-5 pt-1 sm:px-4 lg:pt-3">
        <div className="px-3 sm:px-0">
          {/* Avatar left, name/handle/bio right. */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-24 flex-shrink-0 rounded-[1.5rem] sm:h-28 sm:w-28" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>

          {/* Action buttons. */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-xl sm:h-9 sm:w-32" />
            <Skeleton className="h-8 w-24 rounded-xl sm:h-9 sm:w-28" />
          </div>

          {/* Location / post count / availability. */}
          <div className="mt-3 flex items-center gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      </div>

      {/* Tab bar: Posts | About | Experience. */}
      <div className="flex items-center gap-5 border-b border-line px-4">
        <Skeleton className="my-3 h-4 w-12" />
        <Skeleton className="my-3 h-4 w-12" />
        <Skeleton className="my-3 h-4 w-20" />
      </div>

      {/* Published tab: 3-column square tile grid, same gaps as the real one. */}
      <ul className="grid grid-cols-3 gap-[2px] p-0 sm:gap-1 sm:p-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="block w-full aspect-square rounded-none" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params)

  // Same client-cached pattern as the feed: repeat visits hit the memory cache
  // and paint instantly, instead of re-querying the database every navigation.
  const { data, error } = useCached<ProfileResponse>(`/api/profile/${username}`)

  if (error && (error as any)?.status === 404) notFound()

  return (
    <div className="flex-1 min-w-0 w-full px-0 pb-4 pt-2 sm:px-4 lg:px-6">
      {!data ? (
        <ProfileSkeleton />
      ) : (
        <ProfileBody
          user={data.user}
          prof={data.prof}
          recruiter={data.recruiter}
          isRecruiter={data.isRecruiter}
          isOwn={data.isOwn}
          onList={data.onList}
          posts={data.posts}
          roles={data.roles}
          canFollow={data.canFollow}
          viewerPremiumBlocked={data.viewerPremiumBlocked}
        />
      )}
    </div>
  )
}
