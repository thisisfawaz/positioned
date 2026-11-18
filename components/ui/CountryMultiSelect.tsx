'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { COUNTRIES, countryName } from '@/lib/geo/countries'

/**
 * Searchable multi-select for countries.
 *
 * Built here rather than pulled from a library because the app has no select
 * primitive and the requirement is small: type to filter, grouped by first
 * letter, click to toggle, chosen values shown as removable chips.
 *
 * Values are ISO 3166-1 alpha-2 codes. NEVER display names - the names are UI
 * only and two countries can share a starting word.
 */
export function CountryMultiSelect({
  value,
  onChange,
  placeholder = 'Search countries…',
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click. Escape is handled on the input so typing is not
  // interrupted, which is why this is a plain document listener.
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  // Filter first, THEN group, so the letters shown are only those that still
  // have matches. Grouping unfiltered would leave empty headings behind.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matched = q
      ? COUNTRIES.filter(
          (c) =>
            c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
        )
      : COUNTRIES

    const byLetter = new Map<string, { code: string; name: string }[]>()
    for (const c of matched) {
      const letter = c.name[0].toUpperCase()
      const list = byLetter.get(letter)
      if (list) list.push(c)
      else byLetter.set(letter, [c])
    }
    return Array.from(byLetter.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [query])

  function toggle(code: string) {
    onChange(
      value.includes(code) ? value.filter((c) => c !== code) : [...value, code]
    )
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1 rounded-full border border-brand bg-brand-light/40 px-2.5 py-1 text-[12px] font-medium text-ink"
            >
              {countryName(code)}
              <button
                type="button"
                onClick={() => toggle(code)}
                aria-label={`Remove ${countryName(code)}`}
                className="cursor-pointer text-ink-muted hover:text-ink"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center rounded-lg border border-line px-3 py-2 focus-within:border-brand/30 focus-within:ring-4 focus-within:ring-brand/10"
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent p-0 text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-0"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setOpen((o) => !o)
            inputRef.current?.focus()
          }}
          aria-label={open ? 'Close country list' : 'Open country list'}
          className="ml-2 flex-shrink-0 cursor-pointer text-[11px] text-ink-subtle"
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          /* DROPDOWN. It opens DOWNWARD from the field and is capped so it
             stops at the bottom of the Boost Visibility card rather than
             spilling past it.

             The card itself carries `overflow-hidden`, so anything taller than
             the remaining card space is CLIPPED, not scrolled into view. That
             is why the cap is modest (12rem): it is sized to sit comfortably
             inside the card's padding at the bottom of the form. If countries
             ever look cut off at the bottom, lower this number - do NOT remove
             the card's `overflow-hidden`.

             The list keeps its own scroll (`overflow-y-auto` + `scroll-hidden`)
             so all countries remain reachable within whatever height it gets. */
          className="scroll-hidden absolute top-full z-20 mt-1 max-h-[min(12rem,50vh)] w-full overflow-y-auto rounded-lg border border-line bg-surface shadow-pop"
        >
          {groups.length === 0 ? (
            <p className="px-3 py-3 text-[13px] text-ink-muted">
              No countries match “{query}”.
            </p>
          ) : (
            groups.map(([letter, list]) => (
              <div key={letter}>
                <div className="sticky top-0 bg-surface-sunken px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
                  {letter}
                </div>
                {list.map((c) => {
                  const on = value.includes(c.code)
                  return (
                    <button
                      key={c.code}
                      type="button"
                      role="option"
                      aria-selected={on}
                      onClick={() => toggle(c.code)}
                      className={`flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left text-[13px] hover:bg-surface-sunken ${
                        on ? 'font-semibold text-ink' : 'text-ink-muted'
                      }`}
                    >
                      <span>{c.name}</span>
                      {on && <span className="text-[12px] text-ink">✓</span>}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
