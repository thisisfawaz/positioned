'use client'

/**
 * Unsaved-changes confirmation.
 *
 * Deliberately NOT built on `Modal`: it must render ABOVE the modal it is
 * confirming about, and nesting one Modal inside another would duplicate focus
 * traps, body scroll locks, and Escape handlers. This is a plain overlay with
 * its own z-index.
 */
export function ConfirmDiscard({
  open,
  title = 'Discard changes?',
  body = 'You have unsaved changes. If you close now they will be lost.',
  confirmLabel = 'Discard',
  cancelLabel = 'Keep editing',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title?: string
  body?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl border border-line bg-[var(--modal)] p-5 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-bold text-ink">{title}</h3>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{body}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-[14px] font-semibold text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-rose-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
