'use client'

import { useState } from 'react'
import { ProfileEditModal } from '@/components/profile/ProfileEditModal'

/**
 * Opens the profile edit popup.
 *
 * A client wrapper is needed because the pages that show this button
 * (ProfileBody, WorkDetailBody) are server components and cannot hold state.
 */
export function EditProfileButton({
  label = 'Edit profile',
  className = 'btn-secondary text-sm px-4 py-2',
}: {
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      <ProfileEditModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
