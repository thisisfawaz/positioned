'use client'

import { useState } from 'react'
import { useSWRConfig } from 'swr'
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
  const [dirty, setDirty] = useState(false)
  const { mutate } = useSWRConfig()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create post"
      ariaLabel="Create post"
      isDirty={dirty}
      discardMessage="You have an unfinished post. If you close now it will be discarded."
    >
      <p className="mb-5 text-[14px] text-ink-muted">
        Share something that shows your work, then choose how you'd like people to respond to you
      </p>
      <NewWorkForm
        onDirtyChange={setDirty}
        onPublished={() => {
          // The post exists on the server now. Drop the client copy of the feed
          // so the next render refetches and the new post shows immediately.
          clearCached('/api/home')
          // Also refresh every cached profile page (including the author's own,
          // where the new post should appear at the top). The realtime WorkPost
          // event would eventually do this too, but this makes the author's own
          // profile instant and covers the case where realtime is briefly down.
          mutate((key) => typeof key === 'string' && key.startsWith('/api/profile/'))
          onClose()
        }}
      />
    </Modal>
  )
}
