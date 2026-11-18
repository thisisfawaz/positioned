'use client'

import { useState } from 'react'
import { WorkComposerModal } from '@/components/work/WorkComposerModal'

/**
 * Opens the create-post modal IN PLACE instead of navigating to
 * /profile/work/new. The modal is the only way to create a post - there is no
 * separate page flow any more.
 *
 * Renders whatever the caller passes as the trigger (a pill, a rail button, a
 * bottom-tab circle), so each surface keeps its own styling while sharing the
 * modal + state.
 */
export function CreatePostTrigger({
  children,
  ariaLabel = 'Create post',
  className,
  title,
}: {
  children: React.ReactNode
  ariaLabel?: string
  className?: string
  title?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={ariaLabel} title={title} className={className}>
        {children}
      </button>
      <WorkComposerModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
