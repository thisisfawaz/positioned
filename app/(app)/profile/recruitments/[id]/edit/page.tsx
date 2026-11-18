import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import { RecruitmentForm } from '@/components/recruitments/RecruitmentForm'

export const dynamic = 'force-dynamic'

export default async function EditRecruitmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const r = await prisma.recruitment.findUnique({ where: { id } })
  if (!r) notFound()
  if (r.recruiterId !== user.id) redirect(`/recruitments/${id}`)

  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center gap-3">
        <Link href={`/recruitments/${r.id}`} className="text-gray-500 hover:text-near-black text-lg leading-8">←</Link>
        <h1 className="text-xl font-bold leading-8">Edit role</h1>
      </div>
      <div className="p-3 max-w-2xl">
        <div className="card p-5">
          <RecruitmentForm
            initial={{
              id: r.id,
              title: r.title,
              organization: r.organization || '',
              location: r.location || '',
              employmentType: r.employmentType || '',
              description: r.description || '',
              responsibilities: r.responsibilities || '',
              requirements: r.requirements || '',
              salaryRange: r.salaryRange || '',
              applyUrl: r.applyUrl || '',
              closingDate: r.closingDate
                ? r.closingDate.toISOString().slice(0, 10)
                : '',
            }}
          />
        </div>
      </div>
    </div>
  )
}
