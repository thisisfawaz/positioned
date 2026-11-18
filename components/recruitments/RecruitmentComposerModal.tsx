'use client'

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
  return (
    <Modal open={open} onClose={onClose} title="Post a role" ariaLabel="Post a role">
      <p className="mb-5 text-[14px] text-ink-muted">
        Share a recruitment post, then choose how you&apos;d like people to respond to you
      </p>
      <RecruitmentForm
        key={initialEmploymentType ?? 'default'}
        initialEmploymentType={initialEmploymentType}
      />
    </Modal>
  )
}
