'use client'

import Link from 'next/link'
import { useCached } from '@/lib/client/use-cached'
import { compactCount, relativeTime } from '@/lib/client/social'
import { Skeleton } from '@/components/ui/Skeleton'

type TrendingPost = {
  id: string
  title: string
  likes: number
  views: number
  createdAt: string
  professional?: {
    user?: { id: string; username: string | null }
  } | null
}

export default function TrendingPage() {
  const { data } = useCached<{ posts: TrendingPost[]; recentCount: number }>(
    '/api/trending?take=50'
  )
  const posts = data?.posts ?? []
  const recentCount = data?.recentCount ?? 0

  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="mb-4">
        <h1 className="text-[22px] font-bold text-ink">Trending</h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          See the work making waves today.
        </p>
      </div>

      {!data ? (
        <ul className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="card p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-32" />
            </li>
          ))}
        </ul>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[15px] font-semibold text-ink">Nothing here yet.</p>
          <p className="mt-1 text-[14px] text-ink-muted">
            Trending fills up once posts start getting likes.
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {posts.map((post, i) => {
            const handle = post.professional?.user?.username || post.professional?.user?.id || ''
            const isRecent = i < recentCount
            return (
              <li key={post.id}>
                <Link
                  href={`/${handle}/work/${post.id}`}
                  className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-pop"
                >
                  <span className="w-6 flex-shrink-0 text-[15px] font-bold text-ink-subtle">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">
                      {post.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-ink-subtle">
                      {compactCount(post.likes)} likes · {compactCount(post.views)} views ·{' '}
                      {relativeTime(post.createdAt)}
                    </span>
                  </span>
                  {isRecent && (
                    <span className="flex-shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                      new
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
