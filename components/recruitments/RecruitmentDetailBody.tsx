import Link from 'next/link'
import { deleteRecruitment } from '@/app/(app)/profile/recruitments/actions'
import { relativeTime } from '@/lib/client/social'
import { ApplyAction } from '@/components/recruitments/ApplyAction'

type Recruitment = {
  id: string
  title: string
  organization?: string | null
  location?: string | null
  country?: string | null
  employmentType?: string | null
  salaryRange?: string | null
  salaryHidden: boolean
  description?: string | null
  responsibilities?: string | null
  requirements?: string | null
  applyInstructions?: string | null
  applyMethod?: string | null
  applyUrl?: string | null
  closingDate?: Date | string | null
  createdAt: Date | string
}

type Recruiter = {
  id: string
  name: string
  username: string | null
}

/**
 * Shared role detail markup, used by both the full page and the intercepted modal.
 */
export function RecruitmentDetailBody({
  recruitment: r,
  recruiter,
  isOwner,
  inModal = false,
}: {
  recruitment: Recruitment
  recruiter: Recruiter
  isOwner: boolean
  inModal?: boolean
}) {
  const handle = recruiter.username || recruiter.id
  const closing =
    r.closingDate instanceof Date
      ? r.closingDate.toLocaleDateString()
      : r.closingDate
        ? new Date(r.closingDate).toLocaleDateString()
        : null

  return (
    <div className={inModal ? 'space-y-5' : 'card p-5 space-y-5'}>
      {isOwner && (
        <div className="flex items-center gap-3 justify-end">
          <Link
            href={`/profile/recruitments/${r.id}/edit`}
            className="text-sm font-medium text-ink hover:underline"
          >
            Edit
          </Link>
          <form action={deleteRecruitment}>
            <input type="hidden" name="id" value={r.id} />
            <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
              Delete
            </button>
          </form>
        </div>
      )}

      <div>
        <p className="text-[15px] text-gray-600">
          {[r.organization, r.location, r.employmentType, r.salaryHidden ? null : r.salaryRange]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <p className="text-[15px] text-gray-400 mt-1">
          Posted by{' '}
          <Link href={`/${handle}`} className="hover:underline">
            {recruiter.name}
            {recruiter.username ? ` (@${recruiter.username})` : ''}
          </Link>{' '}
          · {relativeTime(r.createdAt)}
        </p>
      </div>

      {r.description && (
        <div>
          <h2 className="text-[15px] font-semibold mb-1">Description</h2>
          <p className="text-[16px] text-near-black whitespace-pre-wrap">{r.description}</p>
        </div>
      )}

      {r.responsibilities && (
        <div>
          <h2 className="text-[15px] font-semibold mb-1">Responsibilities</h2>
          <p className="text-[16px] text-near-black whitespace-pre-wrap">{r.responsibilities}</p>
        </div>
      )}

      {r.requirements && (
        <div>
          <h2 className="text-[15px] font-semibold mb-1">Requirements</h2>
          <p className="text-[16px] text-near-black whitespace-pre-wrap">{r.requirements}</p>
        </div>
      )}

      {r.applyInstructions && (
        <div>
          <h2 className="text-[15px] font-semibold mb-1">How to apply</h2>
          <p className="text-[16px] text-near-black whitespace-pre-wrap">{r.applyInstructions}</p>
        </div>
      )}

      {closing && <p className="text-[15px] text-gray-500">Closes {closing}</p>}

      {!isOwner && (
        <div className="border-t border-line pt-5">
          <ApplyAction
            recruitment={{
              id: r.id,
              applyMethod: r.applyMethod ?? undefined,
              applyUrl: r.applyUrl ?? null,
              recruiter,
            }}
          />
        </div>
      )}
    </div>
  )
}
