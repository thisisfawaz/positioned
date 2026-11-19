'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * A profile photo that opens LARGER on click.
 *
 * Rendered through a portal to body: the profile avatar can sit inside
 * transformed/fixed ancestors, which would otherwise become the containing
 * block for the fixed overlay and misplace it.
 *
 * Click the backdrop or press Escape to close.
 */
export function PhotoLightbox({
  src,
  alt,
  initials,
  className = 'h-16 w-16 text-lg',
}: {
  src: string | null | undefined
  alt: string
  initials: string
  /** Sizing classes for the inline avatar. */
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const hasPhoto = Boolean(src)

  return (
    <>
      <button
        type="button"
        onClick={() => hasPhoto && setOpen(true)}
        disabled={!hasPhoto}
        aria-label={hasPhoto ? `View ${alt}'s photo` : alt}
        className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light font-bold text-ink ${
          hasPhoto ? 'cursor-zoom-in' : 'cursor-default'
        } ${className}`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${alt}'s photo`}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-[22px] leading-none text-white backdrop-blur hover:bg-white/25"
            >
              ×
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src ?? ''}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            />
          </div>,
          document.body
        )}
    </>
  )
}
