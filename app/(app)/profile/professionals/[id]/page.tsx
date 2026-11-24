import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { WorkCard } from '@/components/work/WorkCard'
import { ContactButton } from '@/components/contact/ContactButton'
import { SaveProfessionalButton } from '@/components/contact/SaveProfessionalButton'
import { availabilityLabel } from '@/lib/client/status'
import { BackIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function ProfessionalProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      professionalProfile: {
        include: {
          skills: { include: { skill: true } },
          experiences: true,
          workPosts: {
            where: { status: 'PUBLISHED' },
            include: {
              professional: { include: { user: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  if (!user || !user.professionalProfile) notFound()

  const currentUser = await getCurrentUser()
  const isRecruiter =
    currentUser?.role === 'RECRUITER' &&
    currentUser?.recruiterProfile?.isVerified === true
  const isSelf = currentUser?.id === user.id

  const alreadySaved =
    isRecruiter && !isSelf && currentUser
      ? Boolean(
          await prisma.savedProfessional.findUnique({
            where: {
              recruiterId_professionalId: {
                recruiterId: currentUser.id,
                professionalId: user.id,
              },
            },
            select: { id: true },
          })
        )
      : false

  const prof = user.professionalProfile
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const socials: { label: string; url: string }[] = []
  if (prof.linkedinUrl) socials.push({ label: 'LinkedIn', url: prof.linkedinUrl })
  if (prof.twitterUrl) socials.push({ label: 'X / Twitter', url: prof.twitterUrl })
  if (prof.githubUrl) socials.push({ label: 'GitHub', url: prof.githubUrl })
  if (prof.websiteUrl) socials.push({ label: 'Website', url: prof.websiteUrl })

  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center gap-3">
        <Link href="/feed" aria-label="Back" className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-surface-sunken hover:text-near-black">
          <BackIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold leading-8">{user.name}</h1>
      </div>

      <div className="p-4">
      <div className="card p-6 md:p-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-2xl font-semibold text-gray-600 flex-shrink-0">
            {prof.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={prof.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {prof.title && <p className="text-gray-600">{prof.title}</p>}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {availabilityLabel(prof.availability) && (
                <span className="status-open text-green-600 text-sm">
                  {availabilityLabel(prof.availability)}
                </span>
              )}
              {(prof.location || prof.country) && (
                <span className="text-sm text-gray-400">
                  {[prof.location, prof.country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
            {prof.bio && (
              <p className="text-gray-700 mt-4 text-sm whitespace-pre-wrap">{prof.bio}</p>
            )}
            {isRecruiter && !isSelf && (
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <ContactButton toUserId={user.id} toName={user.name} />
                <SaveProfessionalButton
                  professionalId={user.id}
                  initialSaved={alreadySaved}
                />
              </div>
            )}
          </div>
        </div>

        {socials.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Links
            </h2>
            <div className="flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1.5 border border-[#e5e5e5] rounded-md hover:bg-gray-50 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {prof.skills.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {prof.skills.map((s) => (
                <span key={s.id} className="bg-gray-50 px-3 py-1 rounded-full text-sm border border-[#e5e5e5]">
                  {s.skill.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {prof.workPosts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Work</h2>
          <div className="space-y-4">
            {prof.workPosts.map((post) => (
              <WorkCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
