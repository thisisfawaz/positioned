import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { FulfilForm } from '@/components/requests/FulfilForm'
import { BackIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function FulfilRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) redirect('/auth/login')

  const request = await prisma.documentRequest.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true, username: true } },
      post: { select: { id: true, title: true } },
      owner: {
        select: {
          name: true,
          professionalProfile: { select: { title: true, profilePhoto: true } },
        },
      },
    },
  })

  if (!request) notFound()

  // Only the author this request is addressed to may see or fill it. The
  // requester has their own view on /requests.
  if (request.ownerId !== user.id) {
    redirect('/requests')
  }

  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="page-header flex items-center gap-3">
        <Link
          href="/profile/notifications"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          aria-label="Back"
        >
          <BackIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold leading-8 truncate">Share documents</h1>
      </div>

      <div className="max-w-2xl px-3 py-3 sm:px-4 sm:py-4">
        <div className="card p-6 md:p-8">
          <p className="text-[15px] text-ink">
            <span className="font-semibold">{request.requester?.name ?? 'Someone'}</span>{' '}
            requested {describeAsk(request.response)} from your post{' '}
            <span className="font-medium">{request.post.title}</span>.
          </p>

          <p className="mt-2 text-[13px] text-ink-subtle">
            Paste the link(s) below. They are shared only with this person.
          </p>

          <div className="mt-6">
            {/* No `alreadyFulfilled` - that rendered a dead "Shared" panel with
                no way to correct a wrong URL. The form stays editable and is
                pre-filled, so links can be updated. */}
            <FulfilForm
              requestId={request.id}
              response={request.response}
              cvUrl={request.cvUrl}
              portfolioUrl={request.portfolioUrl}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Human-readable ask, matching the notification wording. */
function describeAsk(response: string): string {
  if (response === 'CV') return 'your CV'
  if (response === 'PORTFOLIO') return 'your portfolio'
  if (response === 'CV_AND_PORTFOLIO') return 'your CV and portfolio'
  return 'your documents'
}
