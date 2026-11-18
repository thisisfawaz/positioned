'use client'

import { useEffect } from 'react'

export function ScrollBridge() {
  useEffect(() => {
    const onWheel = (event: Event) => {
      const e = event as WheelEvent

      // Never hijack scrolling inside a dialog or its scrollable overlay -
      // the modal owns its own scroll.
      const el = e.target as HTMLElement
      if (el?.closest('[role="dialog"]') || el?.closest('.modal-overlay')) return

      const rail = (e.target as HTMLElement)?.closest('[data-scroll-bridge]')
      if (!rail) return
      const main = document.querySelector('main')
      if (!main) return
      main.scrollTop += e.deltaY
      e.preventDefault()
    }
    document.addEventListener('wheel', onWheel, { passive: false })
    return () => document.removeEventListener('wheel', onWheel)
  }, [])
  return null
}
