'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import {
  requestDocuments,
  type RequestActionState,
} from '@/app/(app)/profile/requests/actions'
import { FulfilForm } from '@/components/requests/FulfilForm'
import { Modal } from '@/components/ui/Modal'
import type { ResponseType } from '@prisma/client'

/**
 * The CTA on a post asking for a CV and/or portfolio.
 *
 * THREE STATES, and the middle one is the one that used to be wrong:
 *   none      -> the action button (Request CV / Submit CV).
 *   PENDING   -> a row exists but NO LINKS YET. Still asks for them; opens the
 *                form in a MODAL. Shows "Add your CV" rather than "Submitted".
 *   FULFILLED -> links exist. Links to /requests as "Submitted - view".
 *
 * The state is SERVER-DERIVED so a refresh cannot lose it - and, critically,
 * a refresh cannot upgrade an empty request into a submitted one.
 */
export function RequestDocumentsCta({
  postId,
  label,
  pendingRequestId,
  isFulfilled = false,
  response,
  isSupplier = false,
}: {
  postId: string
  label: string
  /** Server-derived: id of an existing PENDING request for this post. */
  pendingRequestId?: string
  isFulfilled?: boolean
  response: ResponseType
  /** True when THIS viewer is the one who owes the documents. */
  isSupplier?: boolean
}) {
  const [state, formAction, pending] = useActionState<RequestActionState, FormData>(
    requestDocuments,
    {}
  )
  const [modalOpen, setModalOpen] = useState(false)

  const askedFor =
    response === 'PORTFOLIO'
      ? 'portfolio'
      : response === 'CV'
        ? 'CV'
        : 'CV and portfolio'

  // Fulfilled: the links exist, so send them to the sheet.
  if (isFulfilled) {
    return (
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3.5 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-brand hover:text-white"
      >
        Submitted - view
      </Link>
    )
  }

  // PENDING. Who sees what depends on WHO OWES THE DOCUMENTS:
  //   supplier    -> a button that opens the form (they can act).
  //   requester   -> a status only. Offering them the form would ask them to
  //                  supply documents they are waiting to receive.
  const activeRequestId = state.requestId ?? pendingRequestId

  if (activeRequestId && !isSupplier) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-3.5 py-1.5 text-[13px] font-medium text-ink-subtle">
        Waiting for {askedFor}
      </span>
    )
  }

  if (activeRequestId) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {label}
        </button>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={label}
          ariaLabel={label}
        >
          <FulfilForm
            requestId={activeRequestId}
            response={response}
            onDone={() => setModalOpen(false)}
          />
        </Modal>
      </>
    )
  }

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? 'Sending…' : label}
      </button>
      {state.error && <span className="ml-2 text-[12px] text-red-600">{state.error}</span>}
    </form>
  )
}
