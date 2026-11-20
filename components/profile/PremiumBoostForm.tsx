'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { setPremiumBoostPosts } from '@/app/(app)/profile/visibility/actions'
import { PREMIUM_BOOST_SLOTS } from '@/lib/premium'

type Post = { id: string; title: string; image?: string | null }

/**
 * Premium boost picker. Exactly PREMIUM_BOOST_SLOTS posts, rotatable anytime by
 * changing the selection and saving. No credits, no day/budget maths - the
 * subscription handles it.
 */
export function PremiumBoostForm({
  posts,
  selected,
  premium,
}: {
  posts: Post[]
  selected: string[]
  premium: boolean
}) {
  const [picked, setPicked] = useState<string[]>(selected)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  if (!premium) {
    return (
      <div className="card p-5">
        <p className="text-[14px] font-semibold text-ink">Boosting is part of Premium</p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Boost {PREMIUM_BOOST_SLOTS} of your best posts every month, rotate them anytime.
        </p>
        <Link href="/premium" className="mt-3 inline-flex rounded-xl bg-[var(--brand-black)] px-4 py-2 text-[13px] font-semibold text-[var(--surface)]">
          See Premium
        </Link>
      </div>
    )
  }

  const toggle = (id: string) => {
    setMsg(null); setErr(null)
    setPicked((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id)
      if (cur.length >= PREMIUM_BOOST_SLOTS) return cur
      return [...cur, id]
    })
  }

  return (
    <div className="card p-5">
      <p className="text-[14px] font-semibold text-ink">
        Boosted posts ({picked.length}/{PREMIUM_BOOST_SLOTS})
      </p>
      <p className="mt-1 text-[13px] text-ink-muted">Pick up to {PREMIUM_BOOST_SLOTS}. Change anytime.</p>

      <div className="mt-3 space-y-2">
        {posts.map((p) => {
          const on = picked.includes(p.id)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left ${on ? 'border-brand bg-brand-light' : 'border-line'}`}
            >
              <span className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{p.title}</span>
              <span className="text-[12px] text-brand">{on ? 'Boosted' : ''}</span>
            </button>
          )
        })}
      </div>

      {err && <p className="mt-2 text-[13px] text-rose-500">{err}</p>}
      {msg && <p className="mt-2 text-[13px] text-emerald-600">{msg}</p>}

      <button
        type="button"
        disabled={pending || picked.length === 0}
        onClick={() =>
          start(async () => {
            const res: any = await setPremiumBoostPosts(picked)
            if (res?.error) setErr(res.error === 'premium_required' ? 'Premium required.' : res.error)
            else setMsg('Saved. Your boosted posts are updated.')
          })
        }
        className="mt-4 rounded-xl bg-[var(--brand-black)] px-4 py-2 text-[13px] font-semibold text-[var(--surface)] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save boost selection'}
      </button>
    </div>
  )
}
