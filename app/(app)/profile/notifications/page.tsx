'use client'

import Link from 'next/link'
import { useCached } from '@/lib/client/use-cached'
import { Skeleton } from '@/components/ui/Skeleton'
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

export default function NotificationsPage() {
  const { data } = useCached<ApiResponse>('/api/notifications')
  const notifications = data?.notifications ?? []

  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-[26px]">
          Notifications
        </h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          Messages, likes and document requests.
        </p>
      </div>

      {!data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2 rounded-2xl bg-white p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-[14px] text-ink-subtle">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
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
