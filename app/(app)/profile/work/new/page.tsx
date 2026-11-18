import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { NewWorkForm } from '@/components/work/NewWorkForm'

export const dynamic = 'force-dynamic'

export default async function NewWorkPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'PROFESSIONAL') {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-2">Publish Work</h1>
        <p className="text-gray-600 mt-4">
          Only professionals can publish work.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center gap-3">
        <Link href="/profile/work" className="text-gray-500 hover:text-near-black text-lg leading-8">
          ←
        </Link>
        <h1 className="text-xl font-bold leading-8">Publish Work</h1>
      </div>

      <div className="max-w-2xl px-3 py-3 sm:px-4 sm:py-4">
        <p className="text-sm text-gray-600 mb-6">
          Share a project, case study, achievement, or work sample.
        </p>
      </div>

      <div className="card p-6 md:p-8">
        <NewWorkForm />
      </div>
    </div>
  )
}
