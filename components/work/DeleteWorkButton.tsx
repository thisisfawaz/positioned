'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteWorkPost } from '@/app/(app)/profile/work/actions'

export function DeleteWorkButton({ postId }: { postId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setPending(true)
    setError(null)
    const formData = new FormData()
    formData.set('postId', postId)
    const result = await deleteWorkPost(formData)
    if (result?.error) {
      setError(result.error)
      setPending(false)
      setConfirming(false)
      return
    }
    // Success: stay on this page and re-fetch so the deleted post disappears.
    setPending(false)
    setConfirming(false)
    router.refresh()
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-red-600 hover:text-red-700 hover:underline"
      >
        Delete
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Delete this work?</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
      >
        {pending ? 'Deleting...' : 'Yes, delete'}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="text-sm text-gray-500 hover:text-near-black"
      >
        Cancel
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
