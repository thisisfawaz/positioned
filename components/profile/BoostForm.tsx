'use client'

import { useActionState, useMemo, useState } from 'react'
import {
  BOOST_DAY_OPTIONS,
  boostCost,
  meetsDailyFloor,
  minBoostsForDays,
} from '@/lib/pricing/boosts'
import { startBoost, type BoostFormState } from '@/app/(app)/profile/visibility/actions'
import { PostPickerModal } from '@/components/profile/PostPickerModal'
import { CountryMultiSelect } from '@/components/ui/CountryMultiSelect'
import { NumberInput } from '@/components/ui/NumberInput'
import { ArrowIcon } from '@/components/icons'

type Post = { id: string; title: string; image?: string | null }

function creditsLabel(n: number): string {
  return `${n} boost${n === 1 ? '' : 's'}`
}

export function BoostForm({
  posts,
  boostCredits,
}: {
  posts: Post[]
  boostCredits: number
}) {
  const [selected, setSelected] = useState<string[]>([])
  // 'custom' is a mode, not a number: the day count then comes from
  // customDays so an odd value does not collide with a preset.
  const [dayChoice, setDayChoice] = useState<string>(String(BOOST_DAY_OPTIONS[0]))
  // Custom starts at 1 - the smallest run the form accepts. Picking a preset
  // keeps its own number; picking Custom does NOT inherit the preset's value.
  const [customDays, setCustomDays] = useState('1')
  // Seeded from the day count, not a flat 1: the floor is 1 boost per day, so
  // opening the form on "7 days" with 1 boost would be invalid before the user
  // has touched anything. Picking a different duration RE-SEEDS this (below).
  const [boosts, setBoosts] = useState(String(BOOST_DAY_OPTIONS[0]))
  const [pickerOpen, setPickerOpen] = useState(false)
  // Empty = show everywhere. Kept as ISO codes, never display names.
  const [targetCountries, setTargetCountries] = useState<string[]>([])

  const days =
    dayChoice === 'custom'
      ? Math.round(Number(customDays) || 0)
      : Number(dayChoice)
  const validDays = Number.isInteger(days) && days >= 1 && days <= 365

  const [state, formAction, pending] = useActionState<BoostFormState, FormData>(
    startBoost,
    {}
  )

  const boostCount = Math.round(Number(boosts) || 0)
  const validBoosts = Number.isInteger(boostCount) && boostCount >= 1 && boostCount <= 1000
  const floor = validDays ? minBoostsForDays(days) : 1
  // Budget-based: the day count does NOT multiply the price, it only sets a
  // 1-boost-per-day floor and how thinly the budget is spread.
  const meetsFloor = validDays && validBoosts && meetsDailyFloor(boostCount, days)
  const cost = meetsFloor ? boostCost(boostCount, days) : 0
  const affordable = meetsFloor && boostCredits >= cost
  const perDay = meetsFloor ? Math.round((boostCount / days) * 10) / 10 : 0

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // Changing the window re-seeds the budget to the floor for that window, so
  // the two controls never start out contradicting each other. The user can
  // still raise the budget afterwards (and lower it, which surfaces the error).
  function chooseDays(choice: string, dayCount: number) {
    setDayChoice(choice)
    setBoosts(String(Math.max(1, dayCount)))
  }

  const shown = posts.slice(0, 5)

  if (posts.length === 0) {
    return (
      <p className="rounded-lg bg-surface-sunken px-4 py-3 text-[13px] text-ink-muted">
        You have no published work to boost yet.
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {selected.map((id) => (
        <input key={id} type="hidden" name="postIds" value={id} />
      ))}
      <input type="hidden" name="days" value={validDays ? days : ''} />
      <input type="hidden" name="boosts" value={boostCount} />
      {targetCountries.map((code) => (
        <input key={code} type="hidden" name="targetCountries" value={code} />
      ))}

      {/* Balance */}
      <div className="flex items-baseline justify-between rounded-lg bg-surface-sunken px-4 py-3">
        <span className="text-[13px] text-ink-muted">Your balance</span>
        <span className="text-[15px] font-bold text-ink">
          {creditsLabel(boostCredits)}
        </span>
      </div>

      {/* Post selection */}
      <div>
        <h3 className="text-[14px] font-semibold text-ink">What to boost</h3>
        <p className="mt-1 text-[13px] text-ink-muted">
          Your profile is also shown in Explore for the same period.
        </p>

        <ul className="mt-3 space-y-2">
          {shown.map((p) => (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line p-2.5 hover:bg-surface-sunken">
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggle(p.id)}
                  className="h-4 w-4 flex-shrink-0 cursor-pointer"
                />
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 flex-shrink-0 rounded-md bg-surface-sunken" />
                )}
                <span className="min-w-0 text-[14px] text-ink">{p.title}</span>
              </label>
            </li>
          ))}
        </ul>

        {posts.length > shown.length && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-ink hover:underline"
          >
            All posts
            <ArrowIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Duration */}
      <div>
        <h3 className="text-[14px] font-semibold text-ink">How many days</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BOOST_DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => chooseDays(String(d), d)}
              className={`cursor-pointer rounded-xl border p-3 text-center transition-colors ${
                dayChoice === String(d)
                  ? 'border-brand bg-brand-light/40'
                  : 'border-line hover:bg-surface-sunken'
              }`}
            >
              {/* The NUMBER is the label. "7 days" on every button read as
                  three identical boxes; the count is what the user is picking. */}
              <div className="text-[18px] font-bold leading-none text-ink">{d}</div>
              <div className="mt-1 text-[11px] text-ink-subtle">days</div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setCustomDays('1')
              chooseDays('custom', 1)
            }}
            className={`cursor-pointer rounded-xl border p-3 text-center transition-colors ${
              dayChoice === 'custom'
                ? 'border-brand bg-brand-light/40'
                : 'border-line hover:bg-surface-sunken'
            }`}
          >
            <div className="text-[18px] font-bold leading-none text-ink">
              {dayChoice === 'custom' ? customDays || '1' : '1'}
            </div>
            <div className="mt-1 text-[11px] text-ink-subtle">custom</div>
          </button>
        </div>

        {dayChoice === 'custom' && (
          <div className="mt-3 flex items-center gap-2">
            <NumberInput
              value={customDays}
              onChange={(next) => {
                setCustomDays(next)
                // Typing a day count re-seeds the budget to match, same rule.
                const n = Math.round(Number(next) || 0)
                if (n >= 1) setBoosts(String(n))
              }}
              min={1}
              max={365}
              className="w-24"
              ariaLabel="Number of days"
            />
            <span className="text-[13px] text-ink-muted">days</span>
          </div>
        )}

        {dayChoice === 'custom' && !validDays && (
          <p className="mt-2 text-[12px] text-red-700">
            Enter a whole number of days between 1 and 365.
          </p>
        )}
      </div>

      {/* Boosts */}
      <div>
        <h3 className="text-[14px] font-semibold text-ink">How many boosts</h3>
        <p className="mt-1 text-[13px] text-ink-muted">
          This is your budget (1 boost = $1). The days you chose spread it out,
          so a bigger budget is seen by more recruiters and a longer run is seen
          by fewer per day. Minimum {floor} boosts for {validDays ? days : '-'}{' '}
          days.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <NumberInput
            value={boosts}
            onChange={setBoosts}
            min={1}
            max={1000}
            className="w-28"
            ariaLabel="Number of boosts"
          />
          <span className="text-[13px] text-ink-muted">boosts</span>
        </div>
      </div>

      {/* Countries */}
      <div>
        <h3 className="text-[14px] font-semibold text-ink">Where should it show?</h3>
        <p className="mt-1 text-[13px] text-ink-muted">
          Choose the countries you want recruiters to see this in. Leave all
          unselected to show it everywhere. Based on where the viewer is, not
          where they are from.
        </p>
        <div className="mt-3">
          <CountryMultiSelect
            value={targetCountries}
            onChange={setTargetCountries}
            placeholder="Search countries…"
          />
        </div>
        <p className="mt-1 text-[12px] text-ink-subtle">
          {targetCountries.length === 0
            ? 'Showing everywhere.'
            : `Showing in ${targetCountries.length} countr${targetCountries.length === 1 ? 'y' : 'ies'}.`}
        </p>
      </div>

      {/* Summary + impact note */}
      <div className="rounded-xl bg-surface-sunken px-4 py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-ink-muted">
            {validBoosts ? creditsLabel(boostCount) : '-'} over{' '}
            {validDays ? days : '-'} day{days === 1 ? '' : 's'}
          </span>
          <span className="text-[18px] font-bold text-ink">
            {cost > 0 ? creditsLabel(cost) : '-'}
          </span>
        </div>
        {meetsFloor && (
          <p className="mt-2 text-[12px] leading-relaxed text-ink-subtle">
            Your posts stay near the top of recruiters&apos; feeds for{' '}
            <strong className="text-ink">{days} days</strong> at about{' '}
            <strong className="text-ink">{perDay} boost{perDay === 1 ? '' : 's'} per day</strong>.
          </p>
        )}
        {validDays && validBoosts && !meetsFloor && (
          <p className="mt-2 text-[12px] text-red-700">
            A {days}-day run needs at least {floor} boosts (1 per day).
          </p>
        )}
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || selected.length === 0 || !affordable || !validDays}
        className="btn-primary w-full disabled:opacity-60"
      >
        {pending ? 'Starting boost…' : cost > 0 ? `Start boost (${creditsLabel(cost)})` : 'Start boost'}
      </button>

      {selected.length === 0 && (
        <p className="text-[12px] text-ink-subtle">Select at least one post.</p>
      )}
      {selected.length > 0 && validDays && !validBoosts && (
        <p className="text-[12px] text-ink-subtle">
          Enter a whole number of boosts between 1 and 1000.
        </p>
      )}
      {selected.length > 0 && validDays && validBoosts && !meetsFloor && (
        <p className="text-[12px] text-ink-subtle">
          A {days}-day run needs at least {floor} boosts (1 per day).
        </p>
      )}
      {selected.length > 0 && validDays && validBoosts && !affordable && (
        <p className="text-[12px] text-ink-subtle">
          That costs {creditsLabel(cost)} and you have {creditsLabel(boostCredits)}.
          Buy more boosts at the top of this page.
        </p>
      )}

      <PostPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        posts={posts}
        selected={selected}
        onToggle={toggle}
      />
    </form>
  )
}
