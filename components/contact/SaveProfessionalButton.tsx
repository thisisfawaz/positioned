'use client'

import { useState } from 'react'
import { PlusIcon, CheckIcon } from '@/components/icons'

export function SaveProfessionalButton({
  professionalId,
  initialSaved,
}: {
  professionalId: string
  initialSaved: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, setPending] = useState(false)

  async function toggle() {
    if (pending) return
    setPending(true)

    const next = !saved
    setSaved(next)

    try {
      const res = await fetch(`/api/saved-professional/${professionalId}`, {
        method: next ? 'POST' : 'DELETE',
      })
      if (!res.ok) throw new Error('failed')
    } catch {
      setSaved(!next)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
        saved
          ? 'border-brand bg-brand/10 text-ink'
          : 'border-line text-ink hover:bg-surface-sunken'
      }`}
    >
      {saved ? (
        <CheckIcon className="w-4 h-4" />
      ) : (
        <PlusIcon className="w-4 h-4" />
      )}
      {saved ? 'Added' : 'Add'}
    </button>
  )
}
