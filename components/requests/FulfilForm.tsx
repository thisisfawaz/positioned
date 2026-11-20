'use client'

import { useActionState, useEffect } from 'react'
import { useFormDirty } from '@/lib/client/use-form-dirty'
import Link from 'next/link'
import {
  fulfilDocumentRequest,
  type RequestActionState,
} from '@/app/(app)/profile/requests/actions'
import type { ResponseType } from '@prisma/client'

/**
 * The author's form for supplying CV / portfolio links.
 *
 * FIELDS ARE DRIVEN BY WHAT WAS ASKED FOR. A CV-only request shows one input;
 * a combined request shows two. The server action enforces the same rule, so
 * this is a convenience, not the security boundary.
 */
export function FulfilForm({
  requestId,
  response,
  cvUrl,
  portfolioUrl,
  alreadyFulfilled,
  onDone,
  onDirtyChange,
}: {
  requestId: string
  response: ResponseType
  cvUrl?: string | null
  portfolioUrl?: string | null
  alreadyFulfilled?: boolean
  /** Called after a successful submit, so a modal wrapper can close. */
  onDone?: () => void
  /** Reports unsaved changes upward so the modal can warn before closing. */
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [state, formAction, pending] = useActionState<RequestActionState, FormData>(
    fulfilDocumentRequest,
    {}
  )

  // Close a modal wrapper once the links are saved. Done in an effect because
  // calling a parent setter during render is not allowed.
  useEffect(() => {
    if (state.ok) onDone?.()
  }, [state.ok, onDone])

  const { formRef, isDirty } = useFormDirty(true)
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])
  useEffect(() => {
    if (state.ok) onDirtyChange?.(false)
  }, [state.ok, onDirtyChange])

  const wantsCv = response === 'CV' || response === 'CV_AND_PORTFOLIO'
  const wantsPortfolio = response === 'PORTFOLIO' || response === 'CV_AND_PORTFOLIO'

  if (state.ok || alreadyFulfilled) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          Shared. The requester can now see these links.
        </p>
        <Link
          href="/responses"
          className="mt-2 inline-block text-sm font-semibold text-ink hover:underline"
        >
          View all requests
        </Link>
      </div>
    )
  }

  const inputCls =
    'w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-near-black/10'

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="requestId" value={requestId} />

      {wantsCv && (
        <div>
          <label htmlFor="cvUrl" className="block text-sm font-medium mb-1">
            CV link
          </label>
          <input
            id="cvUrl"
            name="cvUrl"
            type="url"
            defaultValue={cvUrl ?? ''}
            placeholder="https://..."
            className={inputCls}
          />
        </div>
      )}

      {wantsPortfolio && (
        <div>
          <label htmlFor="portfolioUrl" className="block text-sm font-medium mb-1">
            Portfolio link
          </label>
          <input
            id="portfolioUrl"
            name="portfolioUrl"
            type="url"
            defaultValue={portfolioUrl ?? ''}
            placeholder="https://..."
            className={inputCls}
          />
        </div>
      )}

      {state.error === 'premium_required' && (
        <div className="rounded-xl border border-line bg-surface-sunken p-3 text-sm">
          <p className="font-medium text-ink">This needs Positioned Premium.</p>
          <a href="/premium" className="mt-1 inline-block font-semibold text-brand hover:underline">See what Premium gives you</a>
        </div>
      )}
      {state.error && state.error !== 'premium_required' && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-md">
          <p className="text-sm font-medium text-red-700">{state.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Sharing…' : 'Share'}
      </button>
    </form>
  )
}
