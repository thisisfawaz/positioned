import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { redirect } from 'next/navigation'
import {
  ResponsesClient,
  type ResponseGroup,
} from '@/components/requests/ResponsesClient'

export const dynamic = 'force-dynamic'

/**
 * Everything this user has ASKED FOR, grouped by POST.
 *
 * One card per post with a "N responses" count; clicking opens a modal that
 * lists every response for that post (pending and fulfilled mixed, newest
 * first) and scrolls inside the modal. The per-response detail lives in
 * `ResponsesClient`; this page only fetches and groups.
 */
export default async function ResponsesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const requests = await prisma.documentRequest.findMany({
    where: { requesterId: user.id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          username: true,
          professionalProfile: { select: { title: true, profilePhoto: true } },
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          mediaAssets: {
            select: { providerAssetId: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group by post, preserving the newest-first order of the requests inside
  // each group (the query already sorted by createdAt desc).
  const byPost = new Map<string, ResponseGroup>()
  for (const r of requests) {
    const asset = r.post.mediaAssets?.[0]?.providerAssetId ?? ''
    const postImage = asset
      ? /^https?:\/\//i.test(asset)
        ? asset
        : `/uploads/${asset}`
      : null

    const existing = byPost.get(r.post.id)
    const item = {
      id: r.id,
      status: r.status as string,
      createdAt: r.createdAt.toISOString(),
      cvUrl: r.cvUrl,
      portfolioUrl: r.portfolioUrl,
      ownerName: r.owner.name,
      ownerHref: `/${r.owner.username || r.owner.id}`,
      ownerPhoto: r.owner.professionalProfile?.profilePhoto ?? null,
      ownerTitle: r.owner.professionalProfile?.title ?? null,
    }

    if (existing) {
      existing.responses.push(item)
    } else {
      byPost.set(r.post.id, {
        postId: r.post.id,
        postTitle: r.post.title,
        postHref: `/work/${r.post.id}`,
        postImage,
        responses: [item],
      })
    }
  }

  const groups = Array.from(byPost.values())

  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-[26px]">
          Responses
        </h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          CVs and portfolios you have asked for.
        </p>
      </div>

      <ResponsesClient groups={groups} />
    </div>
  )
}
