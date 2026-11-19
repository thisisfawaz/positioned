'use client'

import { useRef, useState } from 'react'

/**
 * Profile photo picker.
 *
 * Uploads through the EXISTING /api/upload route (same validation, same 8MB
 * cap, same LOCAL provider) and puts the returned `/uploads/...` path into a
 * hidden input so the server action reads it like any other field. No new
 * upload path, no new storage rules.
 *
 * The preview is local-only until the form is saved: the file is uploaded
 * immediately (so a bad file fails early) but the profile is not touched until
 * the user submits.
 */
export function ProfilePhotoPicker({
  name = 'profilePhoto',
  initialUrl,
  displayName,
}: {
  name?: string
  initialUrl?: string | null
  displayName: string
}) {
  const [url, setUrl] = useState<string>(initialUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error || 'Could not upload that image.')
        return
      }
      setUrl(data.url as string)
    } catch {
      setError('Could not upload that image.')
    } finally {
      setUploading(false)
      // Allow re-picking the same file after a failure.
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">Profile photo</label>

      <div className="flex items-center gap-4">
        <span className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-[24px] font-bold text-ink sm:h-28 sm:w-28 sm:text-[28px]">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initials || '?'
          )}
        </span>

        <div className="min-w-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center rounded-xl border border-line bg-[var(--modal)] px-4 py-2 text-[14px] font-semibold text-ink transition-colors hover:bg-surface-sunken disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : url ? 'Change photo' : 'Upload photo'}
          </button>

          {url && !uploading && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="ml-2 text-[13px] font-medium text-ink-subtle hover:text-ink"
            >
              Remove
            </button>
          )}

          <p className="mt-1 text-[12px] text-ink-subtle">JPEG, PNG, WebP or GIF · up to 5MB</p>
        </div>
      </div>

      {error && <p className="mt-2 text-[13px] text-rose-600">{error}</p>}

      {/* The server action reads this. Empty string means "remove". */}
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onPick}
        className="hidden"
      />
    </div>
  )
}
