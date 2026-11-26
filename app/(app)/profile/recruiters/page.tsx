'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { initialsOf } from '@/lib/client/social'
import { SearchIcon, SlidersIcon } from '@/components/icons'
import { recruitingLabel } from '@/lib/client/status'

type Recruiter = {
  id: string
  userId: string
  organization: string | null
  role: string | null
  location: string | null
  hiringInterests: string | null
  recruitingStatus: string | null
  isVerified: boolean
  user: { id: string; name: string; username: string | null }
}

const inputCls =
  'w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-subtle focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10'

export default function RecruitersPage() {
  const [query, setQuery] = useState('')
  const [organization, setOrganization] = useState('')
  const [location, setLocation] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const key = useMemo(() => {
    const qs = new URLSearchParams()
    if (query) qs.set('q', query)
    if (organization) qs.set('organization', organization)
    if (location) qs.set('location', location)
    if (verifiedOnly) qs.set('verified', 'true')
    return `/api/recruiters?${qs.toString()}`
  }, [query, organization, location, verifiedOnly])

  const { data, isLoading } = useSWR<{ recruiters: Recruiter[] }>(key)
  const people = data?.recruiters ?? []

  const filterCount =
    (organization ? 1 : 0) + (location ? 1 : 0) + (verifiedOnly ? 1 : 0)

  return (
    <div className="flex-1 min-w-0 w-full pb-4 pt-2">
      <div className="mb-4">
        <h1 className="text-[22px] font-bold text-ink">Recruiters</h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          Find the people hiring for roles you want.
        </p>
      </div>

      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, organization or hiring interest…"
            className="w-full rounded-xl border border-line bg-white py-3 pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-subtle focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 rounded-xl border px-4 text-[14px] font-medium transition-colors ${
            showFilters || filterCount > 0
              ? 'border-brand/30 bg-brand-light text-ink'
              : 'border-line bg-white text-ink-muted hover:bg-surface-sunken'
          }`}
        >
          <SlidersIcon className="h-4 w-4" />
          Filters
          {filterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-[1.25rem] border border-line bg-white p-4 shadow-card sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-ink-subtle">
              Organization
            </span>
            <input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Acme"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-ink-subtle">
              Location
            </span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote"
              className={inputCls}
            />
          </label>
          <label className="flex items-end gap-2 pb-2">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-line text-ink focus:ring-brand/30"
            />
            <span className="text-[14px] text-ink">Verified only</span>
          </label>
        </div>
      )}

      {isLoading ? (
        <SkeletonList />
      ) : people.length === 0 ? (
        <Empty text="No recruiters match those filters." />
      ) : (
        <ul className="space-y-3">
          {people.map((r) => (
            <li key={r.id}>
              <Link
                href={`/${r.user.username || r.userId}`}
                className="block rounded-[1.25rem] border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-pop"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-light text-[15px] font-bold text-ink">
                    {initialsOf(r.user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {r.user.name}
                      </p>
                      {r.isVerified && (
                        <span className="rounded-md bg-brand-light px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-ink">
                          VERIFIED
                        </span>
                      )}
                      {recruitingLabel(r.recruitingStatus) && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
                            r.recruitingStatus === 'NOT_RECRUITING'
                              ? 'bg-gray-100 text-gray-500'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {recruitingLabel(r.recruitingStatus)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {(r.role || r.organization) && (
                      <p className="truncate text-[14px] font-medium text-ink">
                        {[r.role, r.organization].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {r.location && (
                      <p className="truncate text-[13px] text-ink-subtle">{r.location}</p>
                    )}
                    {r.hiringInterests && (
                      <p className="mt-1.5 line-clamp-2 text-[14px] text-ink">
                        {r.hiringInterests}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-[1.25rem] border border-line bg-white p-5"
        >
          <div className="flex gap-3">
            <div className="h-12 w-12 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-40 rounded bg-gray-200" />
              <div className="h-3 w-28 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-[1.25rem] border border-line bg-white py-16 text-center">
      <p className="text-[14px] text-ink-subtle">{text}</p>
    </div>
  )
}
