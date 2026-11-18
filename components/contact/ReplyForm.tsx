'use client'

import { useActionState, useRef, useEffect } from 'react'
import { useSWRConfig } from 'swr'
import { replyToContact, type ContactFormState } from '@/app/(app)/profile/contact/actions'

export function ReplyForm({ contactRequestId }: { contactRequestId: string }) {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    replyToContact,
    {}
  )
  const formRef = useRef<HTMLFormElement>(null)
  const { mutate } = useSWRConfig()

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      mutate(`/api/messages/${contactRequestId}`)
      mutate('/api/messages')
      mutate('/api/unread')
    }
  }, [state.ok, contactRequestId, mutate])

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="contactRequestId" value={contactRequestId} />
      <textarea
        name="body"
        rows={3}
        required
        maxLength={4000}
        placeholder="Write a reply..."
        className="w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-near-black/10"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Sending...' : 'Send reply'}
      </button>
    </form>
  )
}
