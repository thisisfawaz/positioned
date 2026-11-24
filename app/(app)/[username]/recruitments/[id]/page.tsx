import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { recordRecruitmentView } from '@/lib/views/record-recruitment-view'
import { RecruitmentDetailBody } from '@/components/recruitments/RecruitmentDetailBody'
import { BackIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function RecruitmentPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>
}) {
  const { username, id } = await params

  const [r, user] = await Promise.all([
    prisma.recruitment.findUnique({
      where: { id },
      include: { recruiter: { select: { id: true, name: true, username: true } } },
    }),
    getCurrentUser(),
  ])

  if (!r) notFound()

  const handle = r.recruiter.username || r.recruiter.id
  if (username !== handle && username !== r.recruiter.username) notFound()

  const isOwner = user?.id === r.recruiterId

  if (!isOwner) {
    await recordRecruitmentView(r.id, user?.id ?? null)
  }

  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="page-header flex items-center gap-3">
        <Link
          href={`/${handle}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          aria-label="Back"
        >
          <BackIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold leading-8 truncate">{r.title}</h1>
      </div>

      <div className="p-3">
        <RecruitmentDetailBody
          recruitment={r}
          recruiter={r.recruiter}
          isOwner={isOwner}
        />
      </div>
    </div>
  )
}
