'use client'

import { useEffect, useRef } from 'react'

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
  fullScreenOnMobile = false,
}: {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  ariaLabel?: string
  children: React.ReactNode
  maxWidth?: string
  /** Edge-to-edge, full-height panel below `sm`. Desktop keeps the centred card. */
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

  useEffect(() => {
    if (!open) return

    lastFocused.current = document.activeElement as HTMLElement | null

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
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
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`w-full ${maxWidth} bg-surface shadow-pop outline-none ${
          fullScreenOnMobile
            ? 'flex h-full flex-col rounded-none border-0 sm:h-auto sm:max-h-[calc(100dvh-5rem)] sm:rounded-[1.5rem] sm:border sm:border-line'
            : 'rounded-[1.5rem] border border-line'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title !== undefined && (
          <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-[17px] font-bold text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
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
              ? 'scroll-hidden flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:block sm:overflow-visible sm:p-6'
              : 'p-6'
          }
        >
          {children}
        </div>
      </div>
    </div>
  )
}
