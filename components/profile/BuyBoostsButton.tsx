'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { NumberInput } from '@/components/ui/NumberInput'

/**
 * Buy boosts: header button + popup.
 *
 * NO TIERS. The user types how many boosts they want and pays. How a boost
 * run is PRICED (days x boosts) is a property of the BOOST FORM, not of buying
 * credits - this popup only sells the credits.
 *
 * PAYMENTS ARE NOT LIVE. The amount input, the price and the pay button are
 * all real; the submit is deliberately not wired to a provider.
 *
 * WIDE, NOT TALL: the popup is a two-column grid - rules on the left, the
 * form on the right. Stacking everything in one column made a short task into
 * a long scroll.
 */

// Guards against absurd values landing in a future checkout call.
const MIN_BOOSTS = 1
const MAX_BOOSTS = 1000

/**
 * Price per boost in USD. Matches the rule stated in supabase/026: "$1 buys 1
 * boost". This is DISPLAY ONLY - no payment provider is connected. If real
 * pricing is introduced (per-currency, discounts, tax) it belongs in
 * lib/pricing/, not here.
 */
const USD_PER_BOOST = 1

function usd(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })
}

export function BuyBoostsButton({ balance }: { balance: number }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')

  const parsed = Number(amount)
  const valid =
    Number.isInteger(parsed) && parsed >= MIN_BOOSTS && parsed <= MAX_BOOSTS
  const total = valid ? parsed * USD_PER_BOOST : 0

  function close() {
    setOpen(false)
    setAmount('')
  }

  return (
    <>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-primary whitespace-nowrap text-[13px] px-3 py-1.5"
        >
          Buy boosts
        </button>
        <span className="text-[11px] text-ink-subtle">
          {balance} boost{balance === 1 ? '' : 's'} available
        </span>
      </div>

      <Modal
        open={open}
        onClose={close}
        title="Buy boosts"
        ariaLabel="Buy boost credits"
        maxWidth="max-w-[760px]"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT: what a boost buys. */}
          <div className="rounded-xl bg-surface-sunken px-4 py-3">
            <h3 className="text-[13px] font-semibold text-ink">How boosts work</h3>
            <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-ink-muted">
              <li>
                - Boosts are what you <strong className="text-ink">spend to be seen</strong>{' '}
                by more recruiters. Buying them adds to your balance; they are not
                used until you start a boost.
              </li>
              <li>
                - A boosted post is lifted to the top of recruiters&apos; feeds,
                and your profile is featured in Explore for the same time.
              </li>
              <li>
                - When you start a boost, you choose <strong className="text-ink">how
                many days</strong> it runs and <strong className="text-ink">how many
                boosts</strong> go behind it. A run costs days x boosts.
              </li>
              <li>
                - More boosts means a <strong className="text-ink">bigger share</strong>{' '}
                of the boosted slot against everyone else boosting at that time.
              </li>
              <li>
                - You can run more than one boost, and add to one that is already
                running.
              </li>
            </ul>
          </div>

          {/* RIGHT: choose an amount and see the price. */}
          <div>
            <label
              htmlFor="boost-amount"
              className="block text-[14px] font-semibold text-ink"
            >
              How many boosts?
            </label>

            <div className="mt-2 flex items-center gap-2">
              <NumberInput
                id="boost-amount"
                value={amount}
                onChange={setAmount}
                min={MIN_BOOSTS}
                max={MAX_BOOSTS}
                placeholder="e.g. 10"
                ariaLabel="How many boosts"
                className="w-full"
              />
              <span className="flex-shrink-0 text-[13px] text-ink-muted">boosts</span>
            </div>

            <p className="mt-1 text-[12px] text-ink-subtle">
              {usd(USD_PER_BOOST)} per boost
            </p>

            {amount !== '' && !valid && (
              <p className="mt-2 text-[12px] text-red-700">
                Enter a whole number between {MIN_BOOSTS} and {MAX_BOOSTS}.
              </p>
            )}

            {/* The price, before the click. aria-live so the total is
                announced as it changes. */}
            <div
              aria-live="polite"
              className="mt-3 rounded-lg border border-line px-4 py-3"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] text-ink-muted">Total</span>
                <span className="text-[20px] font-bold text-ink">
                  {valid ? usd(total) : '-'}
                </span>
              </div>
              <div className="mt-1 text-[12px] text-ink-subtle">
                {valid
                  ? `${parsed} boost${parsed === 1 ? '' : 's'} added to your balance`
                  : 'Enter an amount to see the price'}
              </div>
            </div>

            <div className="mt-2 rounded-lg bg-surface-sunken px-4 py-3 text-[12px] text-ink-muted">
              Balance: <strong className="text-ink">{balance}</strong> boost
              {balance === 1 ? '' : 's'}
              {valid && (
                <>
                  {' '}
                  - after this purchase:{' '}
                  <strong className="text-ink">{balance + parsed}</strong>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Checkout is not available yet, so this cannot be purchased right now.
          Contact support and we will add the boosts to your account.
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="btn-secondary text-sm px-5 py-2"
          >
            Close
          </button>
          <button
            type="button"
            disabled
            title="Payments are not available yet"
            className="btn-primary cursor-not-allowed text-sm px-5 py-2 disabled:opacity-60"
          >
            {valid ? `Pay ${usd(total)}` : 'Pay'}
          </button>
        </div>
      </Modal>
    </>
  )
}
