import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { RecruitmentForm } from '@/components/recruitments/RecruitmentForm'

export const dynamic = 'force-dynamic'

export default async function NewRecruitmentPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  if (user.role !== 'RECRUITER') {
    return (
      <div className="flex-1 min-w-0 min-h-screen p-4">
        <div className="px-4 pt-5 pb-3">
          <h1 className="text-xl font-bold leading-8">Post a role</h1>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600">Only recruiters can post roles.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center gap-3">
        <Link href="/profile/recruitments" className="text-gray-500 hover:text-near-black text-lg leading-8">←</Link>
        <h1 className="text-xl font-bold leading-8">Post a role</h1>
      </div>
      <div className="p-3 max-w-2xl">
        <div className="card p-5">
          <RecruitmentForm />
        </div>
      </div>
    </div>
  )
}
