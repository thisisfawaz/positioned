'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks whether a form has been changed since it mounted.
 *
 * Works on ANY form without wiring each field: it listens for `input` and
 * `change` events on the form element (both bubble), so it catches typed text,
 * textareas, selects, file picks and the hidden JSON fields the experience
 * repeater writes. It deliberately does NOT try to diff values - "has the user
 * touched this form" is the question the discard prompt needs to answer.
 *
 * `onSaved` (or unmount) resets it, so a form that closes after a successful
 * save never shows the prompt.
 *
 * Usage:
 *   const { formRef, isDirty, reset } = useFormDirty(open)
 *   <form ref={formRef} ...>
 *   <Modal isDirty={isDirty} ...>
 */
export function useFormDirty(enabled: boolean) {
  const [isDirty, setIsDirty] = useState(false)

  // A fresh open starts clean.
  useEffect(() => {
    if (!enabled) setIsDirty(false)
  }, [enabled])

  /** Attach to the <form> element. */
  const formRef = (el: HTMLFormElement | null) => {
    if (!el || (el as any).__dirtyBound) return
    ;(el as any).__dirtyBound = true
    const mark = () => setIsDirty(true)
    el.addEventListener('input', mark)
    el.addEventListener('change', mark)
  }

  return { formRef, isDirty, reset: () => setIsDirty(false) }
}
