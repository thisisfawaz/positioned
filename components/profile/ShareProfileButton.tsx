'use client'

import { useState } from 'react'
import { ShareIcon } from '@/components/icons'

/** Copies the profile's absolute URL to the clipboard. Shows a brief "Copied". */
export function ShareProfileButton({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = `${window.location.origin}/${handle}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Older browsers: fall back to a prompt so the link is still copyable.
      window.prompt('Copy this link', url)
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface-sunken sm:rounded-xl sm:px-4 sm:py-2 sm:text-[14px]"
    >
      <ShareIcon className="h-4 w-4 sm:h-4 sm:w-4" />
      {copied ? 'Copied' : 'Share'}
    </button>
  )
}
