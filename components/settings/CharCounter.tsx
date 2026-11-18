'use client'

/**
 * Live character counter shown under a capped field.
 *
 * The input itself carries `maxLength`, so the user cannot type past the cap;
 * this just shows how much room is left and warns when close.
 */
export function CharCounter({ length, max }: { length: number; max: number }) {
  const remaining = max - length
  const tone =
    remaining <= 0
      ? 'text-rose-600'
      : remaining <= 10
        ? 'text-amber-600'
        : 'text-ink-subtle'
  return (
    <p className={`mt-1 text-right text-[12px] ${tone}`}>
      {length} / {max}
    </p>
  )
}
