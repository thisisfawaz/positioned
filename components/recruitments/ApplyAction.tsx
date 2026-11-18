import Link from 'next/link'

export const applyBtn =
  'inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(91,61,245,0.2)] transition-all hover:bg-brand-dark hover:shadow-[0_6px_18px_rgba(91,61,245,0.28)]'

/**
 * The Apply control for a role. One implementation shared by the feed card and
 * the role detail (page + intercepted modal), so the button never goes missing
 * from one surface again.
 *
 * LINK -> the apply URL, falling back to the role's own page.
 * DM   -> messages addressed to the recruiter.
 * EMAIL-> a mailto: to the address in applyUrl.
 */
export function ApplyAction({
  recruitment,
}: {
  recruitment: {
    id: string
    applyMethod?: string
    applyUrl: string | null
    recruiter?: { id?: string; name: string; username?: string | null }
  }
}) {
  const method = recruitment.applyMethod || 'LINK'

  if (method === 'EMAIL' && recruitment.applyUrl) {
    return (
      <a href={`mailto:${recruitment.applyUrl}`} className={applyBtn}>
        Send Email
      </a>
    )
  }

  if (method === 'DM') {
    const handle = recruitment.recruiter?.username
    return (
      <Link href={handle ? `/messages?to=${handle}` : '/messages'} className={applyBtn}>
        Send DM
      </Link>
    )
  }

  if (recruitment.applyUrl) {
    return (
      <a
        href={recruitment.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={applyBtn}
      >
        Apply
      </a>
    )
  }

  return (
    <Link
      href={`/${recruitment.recruiter?.username || recruitment.recruiter?.id || ''}/recruitments/${recruitment.id}`}
      className={applyBtn}
    >
      Apply
    </Link>
  )
}
