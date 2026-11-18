'use client'

import { useRef } from 'react'


/**
 * Number input with a custom stepper.
 *
 * WHY NOT THE NATIVE SPINNER: the browser's up/down steppers are UA chrome.
 * They cannot be given a colour, they ignore the input's background, and on a
 * dark field the browser paints its own light track behind them - which then
 * has to be inverted with a filter, producing a dark box that only shows on
 * hover. There is no CSS that makes that widget "just the arrows".
 *
 * So the native widget is removed (`appearance: none`) and the arrows are real
 * SVG, drawn with `text-ink` and inheriting the theme. Dark mode gets light
 * arrows, light mode gets dark ones, with no filter and no track.
 *
 * The arrows are a convenience only - the field stays a normal text input, so
 * typing, min/max clamping and arrow-key stepping all still work.
 */

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  id,
  placeholder,
  className = '',
  ariaLabel,
}: {
  /** Raw string, so an empty or half-typed value is preserved. */
  value: string
  onChange: (next: string) => void
  min?: number
  max?: number
  step?: number
  id?: string
  placeholder?: string
  className?: string
  ariaLabel?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function nudge(direction: 1 | -1) {
    const current = Math.round(Number(value) || 0)
    const base = Number.isFinite(current) && current > 0 ? current : (min ?? 1)
    let next = base + direction * step
    if (min !== undefined && next < min) next = min
    if (max !== undefined && next > max) next = max
    onChange(String(next))
    inputRef.current?.focus()
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <input
        ref={inputRef}
        id={id}
        aria-label={ariaLabel}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        /* pr-7 leaves room for the stepper. The native spin buttons are
           hidden globally in globals.css. */
        className="w-full rounded-lg border border-line bg-white py-2 pl-3 pr-7 text-[14px] text-ink placeholder:text-ink-subtle focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10"
      />
      <div className="absolute right-1 flex flex-col">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => nudge(1)}
          aria-label="Increase"
          className="flex h-4 w-5 cursor-pointer items-center justify-center rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink"
        >
          {/* Solid triangle with rounded corners. Drawn inline rather than
              reusing ChevronIcon: that one is a stroked polyline, and a
              stroke with `stroke-linejoin: round` on a small triangle reads
              as a blob. A filled path with quadratic corners stays crisp.
              The raw path points DOWN, so the increase arrow is rotated. */}
          <svg viewBox="0 0 10 6" className="h-[6px] w-[10px] rotate-180 fill-current" aria-hidden="true">
            <path d="M2.2 0.4 L7.8 0.4 Q9.2 0.4 8.3 1.4 L5.7 5.4 Q5 6.4 4.3 5.4 L1.7 1.4 Q0.8 0.4 2.2 0.4 Z" />
          </svg>
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => nudge(-1)}
          aria-label="Decrease"
          className="flex h-4 w-5 cursor-pointer items-center justify-center rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink"
        >
          <svg viewBox="0 0 10 6" className="h-[6px] w-[10px] fill-current" aria-hidden="true">
            <path d="M2.2 0.4 L7.8 0.4 Q9.2 0.4 8.3 1.4 L5.7 5.4 Q5 6.4 4.3 5.4 L1.7 1.4 Q0.8 0.4 2.2 0.4 Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
