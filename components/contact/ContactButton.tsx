'use client'

import { useActionState, useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'
import { sendContactRequest, type ContactFormState } from '@/app/(app)/profile/contact/actions'

export function ContactButton({
  toUserId,
  toName,
  workPostId,
  label = 'Get in touch',
  shape,
  premiumBlocked = false,
}: {
  toUserId: string
  toName: string
  workPostId?: string
  label?: string
  /** Mirror another button's shape (e.g. 'profile') instead of btn-primary. */
  shape?: 'profile'
  /** When true, clicking shows the Premium notice instead of the form. */
  premiumBlocked?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState(false)
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    sendContactRequest,
    {}
  )
  const { mutate } = useSWRConfig()

  useEffect(() => {
    if (state.ok) {
      mutate('/api/messages')
      mutate('/api/unread')
    }
  }, [state.ok, mutate])

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); if (premiumBlocked) setNotice(true) }}
        className={shape === 'profile' ? 'rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark' : 'btn-primary text-sm px-4 py-2'}
      >
        {label}
      </button>

      {notice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-xl">
            <div className="mb-2 flex items-start justify-between">
              <h2 className="text-[15px] font-semibold text-ink">Premium required</h2>
              <button type="button" onClick={() => setNotice(false)} aria-label="Close" className="text-lg leading-none text-ink-subtle hover:text-ink">×</button>
            </div>
            <p className="text-[13px] text-ink-muted">Messaging recruiters and submitting to their posts is part of Positioned Premium.</p>
            <a href="/premium" className="mt-3 inline-flex rounded-xl bg-[var(--brand-black)] px-4 py-2 text-[13px] font-semibold text-[var(--surface)]">See what Premium gives you</a>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="bg-surface w-full overflow-y-auto p-6 shadow-xl rounded-none sm:max-w-lg sm:rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold">Contact {toName}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {state.ok ? (
              <div className="space-y-4">
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-md">
                  Message sent. You'll see their reply in your Messages inbox.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                action={formAction}
                className="space-y-4"
                onSubmit={(e) => {
                  if (premiumBlocked) {
                    e.preventDefault()
                    setNotice(true)
                  }
                }}
              >
                <input type="hidden" name="toUserId" value={toUserId} />
                {workPostId && <input type="hidden" name="workPostId" value={workPostId} />}

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="e.g. Interested in your design work"
                    className="w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-near-black/10"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    maxLength={4000}
                    placeholder="Introduce yourself and explain why you're reaching out."
                    className="w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-near-black/10"
                  />
                </div>

                {state.error === 'premium_required' ? (
                  <div className="rounded-xl border border-line bg-surface-sunken p-3 text-sm">
                    <p className="font-medium text-ink">This needs Positioned Premium.</p>
                    <p className="mt-1 text-ink-muted">Premium lets you message recruiters and submit to their posts.
                      <a href="/premium" className="ml-1 font-semibold text-brand hover:underline">See what Premium gives you</a>
                    </p>
                  </div>
                ) : state.error ? (
                  <p className="text-sm text-red-600">{state.error}</p>
                ) : null}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="btn-primary text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pending ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
