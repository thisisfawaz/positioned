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
  return (
    <div className="mx-auto w-full max-w-[980px] overflow-hidden bg-white lg:rounded-2xl">
      <div className="px-3 pb-5 pt-3 sm:px-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-[1.5rem] sm:h-28 sm:w-28" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 pb-5 sm:grid-cols-3 sm:px-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
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
    <div className="flex-1 min-w-0 w-full px-0 pb-4 pt-3 sm:px-4 lg:px-6">
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
