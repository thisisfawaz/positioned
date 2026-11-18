'use client'

import { useActionState, useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'
import { sendContactRequest, type ContactFormState } from '@/app/(app)/profile/contact/actions'

export function ContactButton({
  toUserId,
  toName,
  workPostId,
}: {
  toUserId: string
  toName: string
  workPostId?: string
}) {
  const [open, setOpen] = useState(false)
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
        onClick={() => setOpen(true)}
        className="btn-primary text-sm px-4 py-2"
      >
        Contact
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg p-6">
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
              <form action={formAction} className="space-y-4">
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

                {state.error && <p className="text-sm text-red-600">{state.error}</p>}

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
