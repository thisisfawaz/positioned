'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { relativeTime } from '@/lib/client/social'
import { SearchIcon, SlidersIcon } from '@/components/icons'

type RecruitmentItem = {
  id: string
  title: string
  organization: string | null
  location: string | null
  country: string | null
  employmentType: string | null
  createdAt: string
}

const EMPLOYMENT_TYPES = ['', 'Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']

const inputCls =
  'w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-subtle focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10'

export default function RecruitmentsPage() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [country, setCountry] = useState('')
  const [type, setType] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const key = useMemo(() => {
    const qs = new URLSearchParams()
    if (query) qs.set('q', query)
    if (role) qs.set('role', role)
    if (country) qs.set('country', country)
    if (type) qs.set('type', type)
    return `/api/recruitments?${qs.toString()}`
  }, [query, role, country, type])

  const { data, isLoading } = useSWR<{ recruitments: RecruitmentItem[] }>(key)
  const roles = data?.recruitments ?? []

  const filterCount =
    (role ? 1 : 0) + (country ? 1 : 0) + (type ? 1 : 0)

  return (
    <div className="flex-1 min-w-0 w-full pb-4">
      <div className="mb-4">
        <h1 className="text-[22px] font-bold text-ink">Jobs</h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          Open roles from recruiters on Positioned.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles, organizations or keywords…"
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
              Role
            </span>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Product Designer"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-ink-subtle">
              Country
            </span>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Nigeria"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-ink-subtle">
              Employment type
            </span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={inputCls}
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t || 'Any type'}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-[1.25rem] border border-line bg-white p-5"
            >
              <div className="space-y-2">
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-3 w-3/4 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-[1.25rem] border border-line bg-white py-16 text-center">
          <p className="text-[14px] text-ink-subtle">
            No roles match those filters.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {roles.map((r) => (
            <li key={r.id}>
              <Link
                href={`/recruitments/${r.id}`}
                className="block rounded-[1.25rem] border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-pop"
              >
                <h2 className="text-[16px] font-semibold leading-snug text-ink">
                  {r.title}
                </h2>
                <p className="mt-1 text-[14px] font-medium text-ink">
                  {[r.organization, r.location, r.country, r.employmentType]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className="mt-2 text-[13px] text-ink-subtle">
                  Posted {relativeTime(r.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
