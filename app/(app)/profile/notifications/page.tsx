'use client'

import Link from 'next/link'
import { useCached } from '@/lib/client/use-cached'
import { relativeTime } from '@/lib/client/social'

type Notification = {
  id: string
  kind: 'message' | 'like' | 'document_request'
  actorName: string
  text: string
  href: string
  createdAt: string
  unread: boolean
}

type ApiResponse = { notifications: Notification[]; totalUnread: number }

function Sh({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer ${className}`} />
}

/** Mirrors the real notification card: unread dot left, then actor/action line,
 *  a one-line text, and a timestamp - inside a rounded-2xl p-5 card. */
function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-white p-5">
          <div className="flex items-start gap-2">
            <Sh className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Sh className="h-4 w-2/3 rounded" />
              <Sh className="h-3.5 w-3/4 rounded" />
              <Sh className="h-3 w-16 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NotificationsPage() {
  // Realtime mutates this key on a new inbound ContactRequest or
  // DocumentRequest, so those appear instantly. This poll is the slow safety
  // net - and the only automatic path for LIKE notifications, which are not
  // subscribed (likes never set the unread badge).
  const { data, isLoading } = useCached<ApiResponse>('/api/notifications', {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })
  const notifications = data?.notifications ?? []

  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      {/* Real header, stays put during load. */}
      <div className="mb-4">
        <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-[26px]">
          Notifications
        </h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          Messages, likes and document requests.
        </p>
      </div>

      {/* Binary: loading or no data -> shimmer cards; loaded -> real list or
          empty. Keyed on isLoading, not !data (keepPreviousData makes data
          truthy early). */}
      {isLoading || !data ? (
        <NotificationsSkeleton />
      ) : notifications.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-[14px] text-ink-subtle">No notifications yet.</p>
        </div>
      ) : (
        <div className="content-fade-in space-y-3">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className={`block rounded-2xl p-5 transition-shadow hover:shadow-md ${
                n.unread ? 'bg-brand-light/40' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    n.unread ? 'bg-rose-500' : 'bg-transparent'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-ink">
                    <span className="font-semibold">{n.actorName}</span>{' '}
                    {n.kind === 'message' ? (
                      <span className="text-ink-muted">sent you a message</span>
                    ) : n.kind === 'document_request' ? (
                      <span className="text-ink-muted">
                        requested documents you can share
                      </span>
                    ) : (
                      <span className="text-ink-muted">liked your post</span>
                    )}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[14px] text-ink-subtle">
                    {n.text}
                  </p>
                  <p className="mt-1 text-[12px] text-ink-subtle">
                    {relativeTime(n.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
