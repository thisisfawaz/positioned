'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Modal } from '@/components/ui/Modal'
import { initialsOf } from '@/lib/client/social'
import { ChevronIcon } from '@/components/icons'

/** One response (a fulfilled or pending DocumentRequest) for a post. */
export type ResponseItem = {
  id: string
  status: string
  createdAt: string
  cvUrl: string | null
  portfolioUrl: string | null
  ownerName: string
  ownerHref: string
  ownerPhoto: string | null
  ownerTitle: string | null
}

/** A post that has at least one response. */
export type ResponseGroup = {
  postId: string
  postTitle: string
  postHref: string
  postImage: string | null
  responses: ResponseItem[]
}

/**
 * Responses as a POST-grouped list with a POPUP detail.
 *
 * Each card is a post, with a "N responses" count. Clicking opens a modal that
 * lists every response for that post and scrolls inside the modal, so a post
 * with many responses stays readable without leaving the page.
 */
export function ResponsesClient({ groups }: { groups: ResponseGroup[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = groups.find((g) => g.postId === openId) ?? null

  if (groups.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[14px] text-ink-subtle">
          You haven&apos;t requested any documents yet.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {groups.map((g) => {
          const pending = g.responses.filter((r) => r.status !== 'FULFILLED').length
          return (
            <button
              key={g.postId}
              type="button"
              onClick={() => setOpenId(g.postId)}
              className="flex w-full items-center gap-3 rounded-2xl bg-white py-3 pl-[5px] pr-3 text-left transition-colors hover:bg-surface-sunken"
            >
              {/* Post thumbnail (falls back to a neutral tile) */}
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-sunken">
                {g.postImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.postImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] text-ink-subtle">Post</span>
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-ink">
                  {g.postTitle}
                </span>
                <span className="mt-0.5 block text-[13px] text-ink-subtle">
                  {g.responses.length}{' '}
                  {g.responses.length === 1 ? 'response' : 'responses'}
                  {pending > 0 && ` · ${pending} pending`}
                </span>
              </span>

              <span className="flex-shrink-0 text-ink-subtle" aria-hidden="true">
                <ChevronIcon className="h-4 w-4" direction="right" />
              </span>
            </button>
          )
        })}
      </div>

      <Modal
        open={open !== null}
        onClose={() => setOpenId(null)}
        title={open?.postTitle ?? 'Responses'}
        maxWidth="max-w-[640px]"
        fullScreenOnMobile
      >
        {open && (
          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {/* Jump to the post itself in the feed reel. */}
            <Link
              href={`/feed?post=${open.postId}`}
              onClick={() => setOpenId(null)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-brand"
            >
              View post
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17L17 7" />
                <path d="M9 7h8v8" />
              </svg>
            </Link>

            {open.responses.map((r) => {
              const fulfilled = r.status === 'FULFILLED'
              return (
                <div key={r.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-start gap-3">
                    <Link href={r.ownerHref} className="flex-shrink-0">
                      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-light text-[12px] font-bold text-ink">
                        {r.ownerPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.ownerPhoto}
                            alt={r.ownerName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initialsOf(r.ownerName)
                        )}
                      </span>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={r.ownerHref}
                        className="block truncate text-[14px] font-semibold text-ink hover:underline"
                      >
                        {r.ownerName}
                      </Link>
                      {r.ownerTitle && (
                        <p className="truncate text-[12px] text-ink-subtle">
                          {r.ownerTitle}
                        </p>
                      )}
                    </div>

                    {!fulfilled && (
                      <span className="flex-shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        Pending
                      </span>
                    )}
                  </div>

                  {fulfilled ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.cvUrl && (
                        <a
                          href={r.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-brand"
                        >
                          CV
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M7 17L17 7" />
                            <path d="M9 7h8v8" />
                          </svg>
                        </a>
                      )}
                      {r.portfolioUrl && (
                        <a
                          href={r.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-brand"
                        >
                          Portfolio
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M7 17L17 7" />
                            <path d="M9 7h8v8" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-[13px] text-ink-subtle">
                      Waiting for {r.ownerName.split(' ')[0]} to share.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Modal>
    </>
  )
}
