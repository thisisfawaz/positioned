type Experience = {
  id: string
  title: string
  company: string
  startDate: Date | string
  endDate: Date | string | null
  current: boolean
  description?: string | null
}

function monthYear(d: Date | string): string {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

/**
 * Work history. Current roles first, then previous ones by end date (newest
 * first). Shared by professional and recruiter profiles - the fields are the
 * same for both.
 */
export function ExperienceSection({ experiences }: { experiences?: Experience[] | null }) {
  if (!experiences || experiences.length === 0) return null

  const sorted = [...experiences].sort((a, b) => {
    if (a.current !== b.current) return a.current ? -1 : 1
    const aEnd = a.current ? Infinity : new Date(a.endDate ?? a.startDate).getTime()
    const bEnd = b.current ? Infinity : new Date(b.endDate ?? b.startDate).getTime()
    if (aEnd !== bEnd) return bEnd - aEnd
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })

  return (
    <div className="border-t border-line px-4 py-4">
      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-ink-subtle">
        Experience
      </h2>
      <ul className="space-y-4">
        {sorted.map((e) => (
          <li key={e.id} className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink">{e.title}</p>
              <p className="text-[14px] text-ink">{e.company}</p>
              <p className="text-[13px] text-ink-subtle">
                {monthYear(e.startDate)} – {e.current ? 'Present' : e.endDate ? monthYear(e.endDate) : ''}
              </p>
              {e.description && (
                <p className="mt-1 whitespace-pre-line text-[14px] text-ink-muted">
                  {e.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
