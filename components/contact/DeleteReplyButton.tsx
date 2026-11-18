'use client'

import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { deleteReply } from '@/app/(app)/profile/contact/actions'

export function DeleteReplyButton({
  replyId,
  isMine,
  createdAt,
}: {
  replyId: string
  isMine: boolean
  createdAt: string
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { mutate } = useSWRConfig()

  const age = Date.now() - new Date(createdAt).getTime()
  const within5Min = age < 5 * 60 * 1000
  const canDelete = within5Min || isMine
  if (!canDelete) return null

  const handleDelete = async () => {
    if (!confirm('Delete this message for both sides?')) return
    setPending(true)
    setError(null)
    const res = await deleteReply(replyId)
    if (res?.error) {
      setError(res.error)
      setPending(false)
    } else {
      mutate('/api/messages')
      mutate('/api/unread')
      // Revalidate all conversation details by mutating the key prefix
      mutate((key) => typeof key === 'string' && key.startsWith('/api/messages/'))
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-60"
        title="Delete message"
      >
        {pending ? '...' : 'Delete'}
      </button>
      {error && <span className="text-xs text-red-600 ml-2">{error}</span>}
    </>
  )
}
