'use client'

import { useState } from 'react'

export type ExperienceEntry = {
  title: string
  company: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export function emptyExperience(): ExperienceEntry {
  return { title: '', company: '', startDate: '', endDate: '', current: false, description: '' }
}

/**
 * Work-history repeater, shared by the professional and recruiter forms.
 *
 * The current list is mirrored into a hidden JSON field on every change, so
 * the server action receives one string rather than a variable number of
 * indexed inputs.
 */
export function ExperienceFields({
  initial,
  inputClass,
}: {
  initial: ExperienceEntry[]
  inputClass: string
}) {
  const [entries, setEntries] = useState<ExperienceEntry[]>(
    initial.length > 0 ? initial : []
  )

  function update(i: number, patch: Partial<ExperienceEntry>) {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  }

  return (
    <div className="border-t border-[#e5e5e5] pt-6">
      <input type="hidden" name="experiences" value={JSON.stringify(entries)} />

      <h3 className="text-sm font-semibold mb-1">Experience</h3>
      <p className="text-xs text-gray-500 mb-4">
        Current and previous roles. Most recent first.
      </p>

      <div className="space-y-4">
        {entries.map((e, i) => (
          <div key={i} className="rounded-lg border border-[#e5e5e5] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Role {i + 1}</span>
              <button
                type="button"
                onClick={() => setEntries((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>

            <input
              value={e.title}
              onChange={(ev) => update(i, { title: ev.target.value })}
              placeholder="Job title, e.g. Product Designer"
              className={inputClass}
            />
            <input
              value={e.company}
              onChange={(ev) => update(i, { company: ev.target.value })}
              placeholder="Company"
              className={inputClass}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Start</label>
                <input
                  type="month"
                  value={e.startDate}
                  onChange={(ev) => update(i, { startDate: ev.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">End</label>
                <input
                  type="month"
                  value={e.endDate}
                  onChange={(ev) => update(i, { endDate: ev.target.value })}
                  disabled={e.current}
                  className={`${inputClass} disabled:opacity-50`}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={e.current}
                onChange={(ev) => update(i, { current: ev.target.checked, endDate: '' })}
                className="h-4 w-4"
              />
              I currently work here
            </label>

            <textarea
              value={e.description}
              onChange={(ev) => update(i, { description: ev.target.value })}
              rows={2}
              placeholder="What did you do? (optional)"
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setEntries((prev) => [...prev, emptyExperience()])}
        className="mt-3 text-sm font-semibold text-ink hover:underline"
      >
        + Add a role
      </button>
    </div>
  )
}
