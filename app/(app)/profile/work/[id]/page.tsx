import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function LegacyWorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const post = await prisma.workPost.findUnique({
    where: { id },
    select: {
      id: true,
      professional: {
        select: { user: { select: { id: true, username: true } } },
      },
    },
  })

  if (!post || !post.professional) notFound()

  const author = post.professional.user
  redirect(`/${author.username || author.id}/work/${post.id}`)
}
