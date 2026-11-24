import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { recordWorkView } from '@/lib/views/record-view'
import { WorkDetailBody } from '@/components/work/WorkDetailBody'
import { BackIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>
}) {
  const { username, id } = await params

  const post = await prisma.workPost.findUnique({
    where: { id },
    include: {
      mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 },
      // ONE post model: the owner is EITHER a professional or a recruiter.
      // Both are included so this page can render whichever one owns it.
      professional: {
        include: {
          user: true,
          skills: { include: { skill: true } },
        },
      },
      recruiterProfile: {
        include: { user: true },
      },
    },
  })

  if (!post) notFound()

  // Normalise the two owner shapes into one. Below this point the page does
  // not care which side owns the post - same as WorkCard.
  const owner = post.professional ?? post.recruiterProfile
  if (!owner) notFound()

  const author = owner.user
  const authorHandle = author.username || author.id

  if (username !== authorHandle && username !== author.username) {
    notFound()
  }

  const currentUser = await getCurrentUser()
  const isOwner = currentUser?.id === owner.userId

  if (!isOwner) {
    await recordWorkView(post.id, currentUser?.id ?? null)
  }

  const isRecruiter =
    currentUser?.role === 'RECRUITER' &&
    currentUser?.recruiterProfile?.isVerified === true

  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="page-header flex items-center gap-3">
        <Link
          href={`/${authorHandle}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          aria-label="Back"
        >
          <BackIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold leading-8 truncate">{post.title}</h1>
      </div>

      <WorkDetailBody
        post={{ ...post, template: post.template ?? 'PROJECT_SHOWCASE' }}
        author={author}
        // Both shapes are reduced to the three fields the body actually uses.
        prof={
          post.professional ?? {
            title: post.recruiterProfile?.organization ?? null,
            location: post.recruiterProfile?.location ?? null,
            profilePhoto: null,
          }
        }
        isOwner={isOwner}
        isRecruiter={isRecruiter}
      />
    </div>
  )
}
