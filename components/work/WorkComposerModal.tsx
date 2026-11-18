'use client'

import { NewWorkForm } from '@/components/work/NewWorkForm'
import { Modal } from '@/components/ui/Modal'
import { clearCached } from '@/lib/client/use-cached'

export function WorkComposerModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title="Create post" ariaLabel="Create post">
      <p className="mb-5 text-[14px] text-ink-muted">
        Share something that shows your work, then choose how you'd like people to respond to you
      </p>
      <NewWorkForm
        onPublished={() => {
          // The post exists on the server now. Drop the client copy of the feed
          // so the next render refetches and the new post shows immediately.
          clearCached('/api/home')
          onClose()
        }}
      />
    </Modal>
  )
}
