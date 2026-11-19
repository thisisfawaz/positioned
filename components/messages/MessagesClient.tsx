'use client'

import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'
import { MessagesList } from '@/components/messages/MessagesList'
import { ConversationView } from '@/components/messages/ConversationView'
import { Modal } from '@/components/ui/Modal'

/**
 * Messages as a single-column inbox with a POPUP thread.
 *
 * The old layout was two panes (list + permanent thread). Per the user, clicking
 * a message should open the conversation as a POPUP and the right side should
 * clear. So the list is now full-width and the conversation lives in the shared
 * Modal.
 *
 * On close we revalidate '/api/messages' and '/api/unread' so the list's unread
 * badge and preview reflect anything that happened in the thread (reading it
 * marks it read, a reply bumps the preview).
 */
export function MessagesClient() {
  const [openId, setOpenId] = useState<string | null>(null)
  const { mutate } = useSWRConfig()

  useEffect(() => {
    if (openId) return
    // Returning from a thread: refresh list + unread counts.
    mutate('/api/messages')
    mutate('/api/unread')
  }, [openId, mutate])

  return (
    <>
      <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
        <div className="mb-4">
          <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-[26px]">Messages</h1>
          <p className="mt-1 text-[14px] text-ink-muted">Your conversations.</p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-surface">
          <MessagesList onOpen={(id) => setOpenId(id)} />
        </div>
      </div>

      <Modal
        open={openId !== null}
        onClose={() => setOpenId(null)}
        title="Conversation"
        maxWidth="max-w-[720px]"
        fullScreenOnMobile
      >
        {/* MOBILE: the modal panel is already full-height and the body is
            flex-1, so the thread fills the screen. DESKTOP: the body is a
            plain block, so give the thread a definite height to scroll in. */}
        <div className="h-full sm:h-[70vh]">
          {openId && <ConversationView id={openId} />}
        </div>
      </Modal>
    </>
  )
}
