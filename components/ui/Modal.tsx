'use client'

import { useEffect, useRef, useState } from 'react'
import { ConfirmDiscard } from '@/components/ui/ConfirmDiscard'

/**
 * Shared modal shell.
 *
 * Carries both `role="dialog"` and `.modal-overlay` because ScrollBridge
 * bails out on either - without them, wheel events over the modal get
 * preventDefault'ed and the panel cannot scroll.
 */
export function Modal({
  open,
  onClose,
  title,
  ariaLabel,
  children,
  maxWidth = 'max-w-[640px]',
  fullScreenOnMobile = true,
  isDirty = false,
  discardMessage,
}: {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  ariaLabel?: string
  children: React.ReactNode
  maxWidth?: string
  /**
   * When true, ANY close attempt (Escape, backdrop, ×) opens a
   * "Discard changes?" confirmation instead of closing. Forms should set this
   * from a comparison against their initial values, so an untouched form still
   * closes immediately.
   */
  isDirty?: boolean
  /** Override the confirmation wording for a specific form. */
  discardMessage?: string
  /**
   * Edge-to-edge, full-height, SQUARE-cornered panel below `sm`. DEFAULT TRUE:
   * the user asked that every popup fill the phone screen. Desktop keeps the
   * centred rounded card. Pass `false` only for a popup that should stay a
   * floating card on mobile.
   */
  fullScreenOnMobile?: boolean
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  // onClose is usually an inline function, so its identity changes on every
  // parent render. Reading it through a ref keeps the effect below keyed on
  // `open` ALONE - otherwise typing in a controlled input inside the modal
  // re-runs the effect, which refocuses the panel and steals the caret on
  // every keystroke.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Dirty state is read through refs inside the keydown effect, which is keyed
  // on `open` only - otherwise every keystroke would tear down and re-add the
  // listener (and steal focus, the same bug onClose had).
  const dirtyRef = useRef(isDirty)
  dirtyRef.current = isDirty
  const [confirmOpen, setConfirmOpen] = useState(false)

  /** Route every close path through here. */
  const requestClose = () => {
    if (dirtyRef.current) setConfirmOpen(true)
    else onCloseRef.current()
  }
  const requestCloseRef = useRef(requestClose)
  requestCloseRef.current = requestClose

  useEffect(() => {
    if (!open) return

    lastFocused.current = document.activeElement as HTMLElement | null

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        requestCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      // Focus trap: keep Tab inside the panel.
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      lastFocused.current?.focus?.()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className={`modal-overlay scroll-hidden fixed inset-0 z-50 flex justify-center bg-ink/30 backdrop-blur-sm ${
        fullScreenOnMobile
          ? 'items-stretch overflow-hidden p-0 sm:items-start sm:overflow-y-auto sm:py-10 sm:px-4'
          : 'items-start overflow-y-auto py-10 px-4'
      }`}
      onClick={requestClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`w-full ${maxWidth} bg-[var(--modal)] shadow-pop outline-none ${
          fullScreenOnMobile
            ? 'flex h-full flex-col rounded-none border-0 sm:h-auto sm:max-h-[calc(100dvh-5rem)] sm:overflow-hidden sm:rounded-[1.5rem] sm:border sm:border-line'
            : 'rounded-[1.5rem] border border-line'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title !== undefined && (
          <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-[17px] font-bold text-ink">{title}</h2>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              ×
            </button>
          </div>
        )}
        <div
          className={
            fullScreenOnMobile
              ? 'scroll-hidden flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:block sm:min-h-0 sm:p-6'
              : 'p-6'
          }
        >
          {children}
        </div>
      </div>

      <ConfirmDiscard
        open={confirmOpen}
        body={discardMessage}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          onCloseRef.current()
        }}
      />
    </div>
  )
}
