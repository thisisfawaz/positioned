import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { redirect } from 'next/navigation'
import { initialsOf, relativeTime } from '@/lib/client/social'

export const dynamic = 'force-dynamic'

/**
 * Everything this user has ASKED FOR.
 *
 * One row per request, reading like a sheet: who the professional is, what was
 * asked for, and - once the author has supplied them - labelled links to the CV
 * and the portfolio. Links open in a new tab, because they point at documents
 * hosted elsewhere.
 *
 * Pending requests are shown too, marked as such, so the requester can see the
 * ask went through rather than wondering whether it did.
 */
export default async function RequestsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const requests = await prisma.documentRequest.findMany({
    where: { requesterId: user.id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          username: true,
          professionalProfile: { select: { title: true, profilePhoto: true } },
        },
      },
      post: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="page-header">
        <h1 className="text-xl font-bold leading-8">Requests</h1>
        <p className="mt-1 text-[13px] text-ink-subtle">
          CVs and portfolios you have asked for.
        </p>
      </div>

      <div className="px-3 py-3 sm:px-4 sm:py-4">
        {requests.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-ink-subtle">
              You haven&apos;t requested any documents yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const ownerProfile = r.owner.professionalProfile
              const ownerHref = `/${r.owner.username || r.owner.id}`
              const fulfilled = r.status === 'FULFILLED'

              return (
                <div key={r.id} className="card p-5">
                  <div className="flex items-start gap-3">
                    {/* Professional identity - the "sheet" heading */}
                    <Link href={ownerHref} className="flex-shrink-0">
                      <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-brand-light text-[13px] font-bold text-ink">
                        {ownerProfile?.profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ownerProfile.profilePhoto}
                            alt={r.owner.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initialsOf(r.owner.name)
                        )}
                      </span>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={ownerHref}
                        className="block truncate text-[15px] font-semibold text-ink hover:underline"
                      >
                        {r.owner.name}
                      </Link>
                      <p className="truncate text-[13px] text-ink-subtle">
                        {[ownerProfile?.title, relativeTime(r.createdAt)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <p className="mt-1 truncate text-[12px] text-ink-subtle">
                        From: {r.post.title}
                      </p>
                    </div>

                    {!fulfilled && (
                      <span className="flex-shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* The links. Only shown once the author has supplied them. */}
                  {fulfilled ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {r.cvUrl && (
                        <a
                          href={r.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-brand hover:text-ink"
                        >
                          CV ↗
                        </a>
                      )}
                      {r.portfolioUrl && (
                        <a
                          href={r.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-brand hover:text-ink"
                        >
                          Portfolio ↗
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-[13px] text-ink-subtle">
                      Waiting for {r.owner.name.split(' ')[0]} to share.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
