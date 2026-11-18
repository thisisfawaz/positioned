import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import { initialsOf } from '@/lib/client/social'
import { RemoveSavedProfessionalButton } from '@/components/contact/RemoveSavedProfessionalButton'

export const dynamic = 'force-dynamic'

export default async function SavedProfessionalsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const saved = await prisma.savedProfessional.findMany({
    where: { recruiterId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      professional: {
        include: { professionalProfile: true },
      },
    },
  })

  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header">
        <h1 className="text-xl font-bold leading-8">Saved Professionals</h1>
      </div>

      <div className="p-3">
        {saved.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">
              You haven&apos;t saved any professionals yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map(({ id, professional }) => {
              const prof = professional.professionalProfile
              return (
                <Link
                  key={id}
                  href={`/profile/professionals/${professional.id}`}
                  className="card block p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                      {prof?.profilePhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={prof.profilePhoto} alt={professional.name} className="w-full h-full object-cover" />
                      ) : (
                        initialsOf(professional.name)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-near-black truncate">
                        {professional.name}
                      </p>
                      {prof?.title && (
                        <p className="text-[14px] text-gray-600 truncate">
                          {prof.title}
                        </p>
                      )}
                      {prof?.location && (
                        <p className="text-[14px] text-gray-400 truncate">
                          {prof.location}
                        </p>
                      )}
                    </div>
                    <RemoveSavedProfessionalButton professionalId={professional.id} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
