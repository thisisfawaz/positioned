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
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header">
        <h1 className="text-xl font-bold leading-8">Notifications</h1>
      </div>

      {!data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-5 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-gray-500 text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className={`card block p-5 hover:shadow-md transition-shadow ${
                n.unread ? 'bg-gray-50/60' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: n.unread ? '#dc2626' : 'transparent' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-near-black">
                    <span className="font-semibold">{n.actorName}</span>{' '}
                    {n.kind === 'message' ? (
                      <span className="text-gray-600">sent you a message</span>
                    ) : n.kind === 'document_request' ? (
                      <span className="text-gray-600">
                        requested documents you can share
                      </span>
                    ) : (
                      <span className="text-gray-600">liked your post</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                    {n.text}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
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
