'use client'

import { useState, useTransition } from 'react'
import { startPremium } from './actions'

export function GoPremiumButton({ premium }: { premium: boolean }) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  if (premium) {
    return (
      <span className="inline-flex items-center rounded-xl bg-emerald-50 px-4 py-2.5 text-[14px] font-semibold text-emerald-600">
        Premium active
      </span>
    )
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res: any = await startPremium()
            if (res?.error) setErr(res.error)
          })
        }
        className="rounded-xl bg-[var(--brand-black)] px-5 py-2.5 text-[14px] font-semibold text-[var(--surface)] disabled:opacity-60"
      >
        {pending ? 'Starting…' : 'Go Premium — $2/month'}
      </button>
      {err && <p className="mt-2 text-[13px] text-rose-500">{err}</p>}
    </div>
  )
}
