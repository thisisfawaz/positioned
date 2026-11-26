'use client'

import Link from 'next/link'
import { availabilityLabel } from '@/lib/client/status'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { initialsOf } from '@/lib/client/social'
import { SearchIcon, SlidersIcon } from '@/components/icons'

type Professional = {
  id: string
  userId: string
  title: string | null
  bio: string | null
  location: string | null
  country: string | null
  profilePhoto: string | null
  availability: string
  user: { id: string; name: string; username: string | null }
  skills: { skill: { name: string } }[]
}

const inputCls =
  'w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-subtle focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10'

export default function ProfessionalsPage() {
  const [query, setQuery] = useState('')
  const [skill, setSkill] = useState('')
  const [location, setLocation] = useState('')
  const [availability, setAvailability] = useState('ANY')
  const [showFilters, setShowFilters] = useState(false)

  const key = useMemo(() => {
    const qs = new URLSearchParams()
    if (query) qs.set('q', query)
    if (skill) qs.set('skill', skill)
    if (location) qs.set('location', location)
    if (availability !== 'ANY') qs.set('availability', availability)
    return `/api/professionals?${qs.toString()}`
  }, [query, skill, location, availability])

  const { data, isLoading } = useSWR<{ professionals: Professional[] }>(key)
  const people = data?.professionals ?? []

  const filterCount =
    (skill ? 1 : 0) + (location ? 1 : 0) + (availability !== 'ANY' ? 1 : 0)

  return (
    <div className="flex-1 min-w-0 w-full pb-4 pt-2">
      <div className="mb-4">
        <h1 className="text-[22px] font-bold text-ink">Professionals</h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          Discover people by skill, role and availability.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, title or skill…"
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
              Skill
            </span>
            <input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g. Figma"
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
              placeholder="e.g. Lagos"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-ink-subtle">
              Availability
            </span>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className={inputCls}
            >
              <option value="ANY">Any availability</option>
              <option value="AVAILABLE">Open to work</option>
            </select>
          </label>
        </div>
      )}

      {isLoading ? (
        <SkeletonList />
      ) : people.length === 0 ? (
        <Empty text="No professionals match those filters." />
      ) : (
        <ul className="space-y-3">
          {people.map((p) => (
            <li key={p.id}>
              <ProfessionalRow professional={p} />
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

function ProfessionalRow({ professional }: { professional: Professional }) {
  const p = professional
  const handle = p.user.username || p.userId
  const location = [p.location, p.country].filter(Boolean).join(', ')
  const skills = p.skills.map((s) => s.skill.name)
  const available = p.availability !== 'NOT_AVAILABLE'

  return (
    <Link
      href={`/${handle}`}
      className="block rounded-[1.25rem] border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-pop"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-light text-[15px] font-bold text-ink">
          {p.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.profilePhoto} alt={p.user.name} className="h-full w-full object-cover" />
          ) : (
            initialsOf(p.user.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-ink">{p.user.name}</p>
            {availabilityLabel(p.availability) && (
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600">
                {availabilityLabel(p.availability)?.toUpperCase()}
              </span>
            )}
          </div>
          {p.title && (
            <p className="truncate text-[14px] font-medium text-ink">{p.title}</p>
          )}
          {location && (
            <p className="truncate text-[13px] text-ink-subtle">{location}</p>
          )}
          {p.bio && (
            <p className="mt-1.5 line-clamp-2 text-[14px] text-ink">{p.bio}</p>
          )}
          {skills.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-surface-sunken px-2.5 py-1 text-[12px] font-medium text-ink-muted"
                >
                  #{s.replace(/\s+/g, '')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
