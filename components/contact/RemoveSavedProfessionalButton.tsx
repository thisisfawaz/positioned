'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CloseIcon } from '@/components/icons'

export function RemoveSavedProfessionalButton({
  professionalId,
}: {
  professionalId: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function remove(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (pending) return
    setPending(true)

    try {
      const res = await fetch(`/api/saved-professional/${professionalId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('failed')
      router.refresh()
    } catch {
      // keep the row on failure
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      aria-label="Remove from saved talent"
      className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors disabled:opacity-60"
    >
      <CloseIcon className="w-4 h-4" />
    </button>
  )
}
