'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { useCached } from '@/lib/client/use-cached'
import { initialsOf } from '@/lib/client/social'
import { FollowPostsButton } from '@/components/contact/FollowPostsButton'
import { DEMO_PEOPLE, DEMO_POSTS } from '@/lib/client/demo-posts'
import { DEMO_PEOPLE_2, DEMO_POSTS_2 } from '@/lib/client/demo-posts-2'

type GridItem = {
  id: string
  userId: string
  name: string
  username: string | null
  title: string | null
  profilePhoto: string | null
  postId: string | null
  image: string | null
}

type TrendingPost = {
  id: string
  title: string
  likes: number
  views: number
  mediaAssets?: { providerAssetId: string }[] | null
  professional?: {
    user?: { id: string; username: string | null }
  } | null
}

/**
 * Right column, from the reference: "Discover professionals" (three rows with
 * a Follow button each, plus See all) above "Trending work" (a 2x2 image
 * grid). Hidden below `xl`, where the layout is rail + feed only.
 */
export function RightRail({ role }: { role: string }) {
  const { data: grid } = useSWR<{ items: GridItem[] }>('/api/explore-grid?take=8')
  const { data: trending } = useCached<{ posts: TrendingPost[] }>('/api/trending')

  // STATIC DEMO FALLBACKS - see lib/client/demo-posts.ts. Used only when the
  // live data is empty, so the rail can be judged with real images.
  const people = (grid?.items?.length ? grid.items : [...DEMO_PEOPLE, ...DEMO_PEOPLE_2]).slice(0, 3)
  const trendingPosts = (trending?.posts?.length
    ? trending.posts
    : [...DEMO_POSTS, ...DEMO_POSTS_2]
  ).slice(0, 4)

  return (
    <aside className="hidden w-[320px] flex-shrink-0 flex-col gap-4 xl:flex">
      {/* Discover professionals */}
      <section className="rounded-2xl border border-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-ink">Discover professionals</h2>
          <Link
            href="/explore"
            className="text-[12px] font-semibold text-ink hover:underline"
          >
            See all
          </Link>
        </div>

        {people.length === 0 ? (
          <p className="text-[13px] text-ink-subtle">No suggestions yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {people.map((p) => (
              <li key={p.id} className="flex items-center gap-2.5">
                <Link
                  href={`/${p.username || p.userId}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-[12px] font-bold text-ink">
                    {p.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.profilePhoto} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      initialsOf(p.name)
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-ink">
                      {p.name}
                    </span>
                    <span className="block truncate text-[11px] text-ink-subtle">
                      {p.title || 'Professional'}
                    </span>
                  </span>
                </Link>
                <FollowPostsButton
                  userId={p.userId}
                  initialFollowing={false}
                  size="pill"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Trending work */}
      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="mb-3 text-[15px] font-bold text-ink">Trending work</h2>

        {trendingPosts.length === 0 ? (
          <p className="text-[13px] text-ink-subtle">Nothing trending yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {trendingPosts.map((post) => {
              const asset = post.mediaAssets?.[0]
              const href = `/${post.professional?.user?.username || post.professional?.user?.id || ''}/work/${post.id}`
              return (
                <Link
                  key={post.id}
                  href={href}
                  className="group relative overflow-hidden rounded-xl bg-surface-sunken"
                >
                  {asset ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        /^https?:\/\//i.test(asset.providerAssetId)
                          ? asset.providerAssetId
                          : `/uploads/${asset.providerAssetId}`
                      }
                      alt={post.title}
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-brand-light to-surface-sunken p-2 text-center text-[11px] font-semibold leading-tight text-ink">
                      {post.title}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </aside>
  )
}
