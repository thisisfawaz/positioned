'use client'

import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { hideConversation, deleteInitialMessage } from '@/app/(app)/profile/contact/actions'
import { TrashIcon } from '@/components/icons'

export function ConversationActions({
  contactRequestId,
  isSender,
  createdAt,
}: {
  contactRequestId: string
  isSender: boolean
  createdAt: string
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { mutate } = useSWRConfig()

  const within5Min = Date.now() - new Date(createdAt).getTime() < 5 * 60 * 1000
  const canHardDelete = within5Min || isSender

  const refresh = () => {
    mutate('/api/messages')
    mutate('/api/unread')
  }

  const handleHide = async () => {
    setPending(true)
    setError(null)
    const res = await hideConversation(contactRequestId)
    if (res?.error) {
      setError(res.error)
      setPending(false)
    } else {
      refresh()
    }
  }

  const handleHardDelete = async () => {
    if (!confirm('Delete this conversation for both sides? This cannot be undone.')) return
    setPending(true)
    setError(null)
    const res = await deleteInitialMessage(contactRequestId)
    if (res?.error) {
      setError(res.error)
      setPending(false)
    } else {
      refresh()
    }
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <button
        type="button"
        onClick={handleHide}
        disabled={pending}
        className="text-gray-500 hover:text-near-black disabled:opacity-60"
      >
        Remove from inbox
      </button>
      {canHardDelete && (
        <button
          type="button"
          onClick={handleHardDelete}
          disabled={pending}
          aria-label="Delete for everyone"
          title="Delete for everyone"
          className="text-red-600 hover:text-red-700 disabled:opacity-60"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
      {error && <span className="text-red-600">{error}</span>}
    </div>
  )
}
