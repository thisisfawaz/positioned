'use client'

import { useState } from 'react'
import { RecruitmentForm } from '@/components/recruitments/RecruitmentForm'
import { Modal } from '@/components/ui/Modal'

export function RecruitmentComposerModal({
  open,
  onClose,
  initialEmploymentType,
}: {
  open: boolean
  onClose: () => void
  initialEmploymentType?: string
}) {
  const [dirty, setDirty] = useState(false)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Post a role"
      ariaLabel="Post a role"
      isDirty={dirty}
      discardMessage="You have an unfinished role post. If you close now it will be discarded."
    >
      <p className="mb-5 text-[14px] text-ink-muted">
        Share a recruitment post, then choose how you&apos;d like people to respond to you
      </p>
      <RecruitmentForm
        onDirtyChange={setDirty}
        key={initialEmploymentType ?? 'default'}
        initialEmploymentType={initialEmploymentType}
      />
    </Modal>
  )
}
