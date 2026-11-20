'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import {
  requestDocuments,
  submitPortfolioResponse,
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
 *   FULFILLED -> links exist. Links to /responses as "Submitted - view".
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
        href="/responses"
        className="btn-primary text-sm px-4 py-2"
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
      <span className="btn-primary text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed">
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
          className="btn-primary text-sm px-4 py-2"
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

  // SUPPLIER (professional responding to a recruiter post): open the link form
  // FIRST. Premium is enforced server-side in submitPortfolioResponse.
  if (isSupplier) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary text-sm px-4 py-2"
        >
          {label}
        </button>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={label} ariaLabel={label}>
          <SupplierSubmitForm
            postId={postId}
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
        className="btn-primary text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Sending…' : label}
      </button>
      {state.error && <span className="ml-2 text-[12px] text-red-600">{state.error}</span>}
    </form>
  )
}


function SupplierSubmitForm({
  postId,
  response,
  onDone,
}: {
  postId: string
  response: ResponseType
  onDone: () => void
}) {
  const [state, formAction, pending] = useActionState<RequestActionState, FormData>(
    submitPortfolioResponse,
    {}
  )
  const wantsCv = response === 'CV' || response === 'CV_AND_PORTFOLIO'
  const wantsPortfolio = response === 'PORTFOLIO' || response === 'CV_AND_PORTFOLIO'

  if (state.ok) {
    return (
      <div className="text-[14px] text-ink">
        <p className="font-semibold">Submitted.</p>
        <button type="button" onClick={onDone} className="mt-3 rounded-xl bg-[var(--brand-black)] px-4 py-2 text-[13px] font-semibold text-[var(--surface)]">Done</button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      {wantsCv && (
        <label className="block text-[13px] font-medium text-ink">
          CV link
          <input name="cvUrl" type="url" placeholder="https://…" className="mt-1 w-full rounded-xl border border-line bg-[var(--modal)] px-3 py-2 text-[14px] text-ink" />
        </label>
      )}
      {wantsPortfolio && (
        <label className="block text-[13px] font-medium text-ink">
          Portfolio link
          <input name="portfolioUrl" type="url" placeholder="https://…" className="mt-1 w-full rounded-xl border border-line bg-[var(--modal)] px-3 py-2 text-[14px] text-ink" />
        </label>
      )}
      {state.error === 'premium_required' ? (
        <div className="rounded-xl border border-line bg-surface-sunken p-3 text-[13px]">
          <p className="font-medium text-ink">This needs Positioned Premium.</p>
          <a href="/premium" className="mt-1 inline-block font-semibold text-brand hover:underline">See what Premium gives you</a>
        </div>
      ) : state.error ? (
        <p className="text-[13px] text-rose-500">{state.error}</p>
      ) : null}
      <div className="flex justify-end gap-3 pt-1">
        <button type="button" onClick={onDone} className="rounded-xl px-4 py-2 text-[13px] font-medium text-ink-muted">Cancel</button>
        <button type="submit" disabled={pending} className="rounded-xl bg-[var(--brand-black)] px-4 py-2 text-[13px] font-semibold text-[var(--surface)] disabled:opacity-60">
          {pending ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
