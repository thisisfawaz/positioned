'use client'

import { useSWRConfig } from 'swr'
import { useCached } from '@/lib/client/use-cached'
import { useEffect, useRef } from 'react'
import { useUser } from '@/lib/client/use-user'
import { useTyping } from '@/lib/client/use-typing'
import { ReplyForm } from '@/components/contact/ReplyForm'
import { DeleteReplyButton } from '@/components/contact/DeleteReplyButton'
import { Skeleton } from '@/components/ui/Skeleton'

import type { ConversationDetail } from '@/services/queries/messages'

type ApiResponse = { conversation: ConversationDetail }

export function ConversationView({ id }: { id: string }) {
  // Realtime (lib/client/use-realtime.ts) mutates this exact key on a new
  // ContactReply, so replies appear instantly. This poll is the slow safety
  // net for a dropped WebSocket; revalidateOnFocus catches up on tab return.
  const { data, error } = useCached<ApiResponse>(`/api/messages/${id}`, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })
  const { mutate } = useSWRConfig()
  const { user } = useUser()
  const markedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Ephemeral "is typing..." - the receiver half. The sender half lives in
  // ReplyForm; both are on the same typing:<id> broadcast channel.
  const { typingName, notifyTyping, notifyStop } = useTyping(id, {
    userId: user?.id,
    name: user?.name,
  })

  // Keep the newest message in view. Runs when the thread loads and again
  // whenever the message count changes (i.e. after sending a reply).
  const itemCount = data?.conversation?.items?.length ?? 0
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [id, itemCount])

  useEffect(() => {
    if (!data || markedRef.current) return
    markedRef.current = true
    fetch(`/api/messages/${id}/read`, { method: 'POST' }).then(() => {
      mutate('/api/unread')
      mutate('/api/messages')
    })
  }, [data, id, mutate])

  if (!data) {
    return (
      <div className="space-y-6 rounded-2xl bg-surface p-5">
        <Skeleton className="h-6 w-64" />
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-surface p-5">
        <p className="text-[14px] text-ink-subtle">Failed to load conversation.</p>
      </div>
    )
  }

  const c = data.conversation
  const myLastRead = c.myLastRead ? new Date(c.myLastRead) : null

  return (
    <div className="flex h-full flex-col overflow-hidden sm:rounded-2xl sm:bg-surface">
      {/* One compact line: name + subject. The old two-line header ate too much
          vertical space in the popup. */}
      <div className="flex-shrink-0 border-b border-line px-4 py-2.5">
        <p className="truncate text-[13px] text-ink-subtle">
          <span className="font-semibold text-ink">{c.otherName}</span>
          {c.subject ? <span> · {c.subject}</span> : null}
        </p>
      </div>

      {/* EVERYTHING scrolls now - messages AND the reply form - so the reply is
          no longer pinned static at the bottom. */}
      <div ref={scrollRef} className="scroll-hidden min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
        {c.items.map((item, i) => {
          const itemDate = new Date(item.createdAt)
          const isUnread = !item.isMine && (!myLastRead || itemDate > myLastRead)
          const isInitial = item.id === 'initial'

          // Group only when the previous message is from the same person AND
          // arrived within 5 minutes. A later message always gets its own
          // timestamp - otherwise a new send looks like it reuses the old one.
          const prev = c.items[i - 1]
          const sameSender = prev ? prev.isMine === item.isMine : false
          const closeInTime = prev
            ? itemDate.getTime() - new Date(prev.createdAt).getTime() <
              5 * 60 * 1000
            : false
          const grouped = sameSender && closeInTime

          return (
            <div
              key={item.id}
              className={`flex flex-col ${item.isMine ? 'items-end' : 'items-start'} ${
                grouped ? 'mt-1' : 'mt-4'
              }`}
            >
              {!grouped && (
                <div
                  className={`mb-1 flex items-center gap-2 ${
                    item.isMine ? 'flex-row-reverse' : ''
                  }`}
                >
                  <span className="text-[12px] font-semibold text-ink-muted">
                    {item.isMine ? 'You' : item.fromName}
                  </span>
                  <span className="text-[11px] text-ink-subtle">
                    {itemDate.toLocaleString()}
                  </span>
                  {!isInitial && (
                    <DeleteReplyButton
                      replyId={item.id}
                      isMine={item.isMine}
                      createdAt={item.createdAt}
                    />
                  )}
                </div>
              )}

              {/* Bubble hugs its content - this is the messenger pattern. */}
              <div
                className={`w-fit max-w-[50%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed whitespace-pre-wrap ${
                  item.isMine
                    ? 'bg-brand text-white rounded-br-md'
                    : 'border border-line bg-surface text-ink rounded-bl-md'
                } ${isUnread ? 'ring-2 ring-brand/30' : ''}`}
              >
                {item.body}
              </div>

              {isUnread && (
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-ink">
                  New
                </span>
              )}
            </div>
          )
        })}
        </div>

        {typingName && (
          <p className="mt-2 px-1 text-[12px] italic text-ink-subtle">
            {typingName} is typing...
          </p>
        )}

        <div className="mt-6 border-t border-line pt-4">
          <h2 className="mb-2 text-[13px] font-semibold text-ink">Reply</h2>
          <ReplyForm
            contactRequestId={c.id}
            onTyping={notifyTyping}
            onStopTyping={notifyStop}
          />
        </div>
      </div>
    </div>
  )
}
