import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function LegacyRecruitmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const r = await prisma.recruitment.findUnique({
    where: { id },
    select: {
      id: true,
      recruiter: { select: { id: true, username: true } },
    },
  })

  if (!r) notFound()

  const handle = r.recruiter.username || r.recruiter.id
  redirect(`/${handle}/recruitments/${r.id}`)
}
