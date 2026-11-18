import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import { relativeTime } from '@/lib/client/social'

export const dynamic = 'force-dynamic'

export default async function MyRecruitmentsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const recruitments =
    user.role === 'RECRUITER'
      ? await prisma.recruitment.findMany({
          where: { recruiterId: user.id },
          orderBy: { createdAt: 'desc' },
        })
      : []

  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold leading-8">My Recruitments</h1>
        {user.role === 'RECRUITER' && (
          <Link href="/profile/recruitments/new" className="rounded-xl bg-brand px-4 py-2 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(91,61,245,0.2)] transition-all hover:bg-brand-dark">
            Post a role
          </Link>
        )}
      </div>

      <div className="p-3">
        {recruitments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">You haven&apos;t posted any roles yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recruitments.map((r) => (
              <Link key={r.id} href={`/recruitments/${r.id}`} className="card block p-5 hover:shadow-md transition-shadow">
                <h2 className="text-[14px] font-semibold text-ink">{r.title}</h2>
                <p className="text-[14px] text-gray-600 mt-1">
                  {[r.organization, r.location, r.employmentType].filter(Boolean).join(' · ')}
                </p>
                <p className="text-[14px] text-gray-400 mt-2">
                  {r.status} · {relativeTime(r.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
