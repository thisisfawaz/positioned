'use client'

import Link from 'next/link'
import { useCached } from '@/lib/client/use-cached'
import { ConversationActions } from '@/components/contact/ConversationActions'
import { Skeleton } from '@/components/ui/Skeleton'
import { relativeTime } from '@/lib/client/social'

import type { ConversationListItem } from '@/services/queries/messages'

type ApiResponse = {
  conversations: ConversationListItem[]
  unread: { totalUnread: number; byConversation: Record<string, number> }
}

export function MessagesList({ onOpen }: { onOpen: (id: string) => void }) {
  const { data, error } = useCached<ApiResponse>('/api/messages')

  if (!data) {
    return (
      <div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 border-b border-line px-4 py-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-12 text-center text-[14px] text-ink-subtle">
        Failed to load messages.
      </div>
    )
  }

  const conversations = data?.conversations ?? []

  if (conversations.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-[14px] text-ink-subtle">No messages yet.</p>
      </div>
    )
  }

  return (
    <div>
      {conversations.map((c) => {
        const isUnread = c.unreadCount > 0
        return (
          <div
            key={c.id}
            className={`border-b border-line transition-colors last:border-b-0 hover:bg-surface-sunken ${
              isUnread ? 'bg-brand-light/40' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => onOpen(c.id)}
              className="block w-full py-3 pl-[5px] pr-4 text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/professionals/${c.otherId}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[15px] hover:underline ${
                        isUnread ? 'font-bold text-ink' : 'font-semibold text-ink'
                      }`}
                    >
                      {c.otherName}
                    </Link>
                    {isUnread && (
                      <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold leading-none text-white">
                        {c.unreadCount > 99 ? '99+' : c.unreadCount}
                      </span>
                    )}
                    <span className="text-ink-subtle">·</span>
                    <span className="text-[13px] text-ink-subtle">
                      {relativeTime(c.lastActivityAt)}
                    </span>
                  </div>
                  <p className={`mt-0.5 truncate text-[14px] ${isUnread ? 'font-semibold text-ink' : 'text-ink'}`}>
                    {c.subject}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-ink-muted">
                    {c.messagePreview}
                  </p>
                </div>

                {c.replyCount > 0 && (
                  <span className="whitespace-nowrap text-[12px] text-ink-subtle">
                    {c.replyCount} repl{c.replyCount === 1 ? 'y' : 'ies'}
                  </span>
                )}
              </div>
            </button>

            <div className="flex justify-end px-4 pb-2">
              <ConversationActions
                contactRequestId={c.id}
                isSender={c.isSender}
                createdAt={c.createdAt}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
