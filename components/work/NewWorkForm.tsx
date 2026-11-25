'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { useFormDirty } from '@/lib/client/use-form-dirty'
import {
  createWorkPost,
  updateWorkPost,
  type WorkFormState,
} from '@/app/(app)/profile/work/actions'
import { setPendingPost } from '@/lib/client/pending-post'
import { useUser } from '@/lib/client/use-user'
import {
  responsesForSide,
  composerLabel,
  type PostSide,
} from '@/lib/posts/response-types'
import type { ResponseType } from '@prisma/client'
import {
  ASPECT_RATIOS,
  nearestAspect,
  parseAspect,
  type AspectRatio,
} from '@/lib/posts/aspect'
import { youtubeEmbedUrl as youtubeEmbed } from '@/lib/client/youtube'

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  textarea,
}: {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  textarea?: boolean
}) {
  const cls =
    'w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-near-black/10'
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea id={name} name={name} rows={3} defaultValue={defaultValue} placeholder={placeholder} required={required} className={cls} />
      ) : (
        <input id={name} name={name} type="text" defaultValue={defaultValue} placeholder={placeholder} required={required} className={cls} />
      )}
    </div>
  )
}

type Initial = {
  id: string
  caption?: string | null
  mediaUrl?: string | null
  videoUrl?: string | null
  desiredResponse?: ResponseType | null
  applyUrl?: string | null
  aspect?: AspectRatio | null
}

export function WorkForm({
  initial,
  onPublished,
  onDirtyChange,
}: {
  initial?: Initial
  /** Called after a successful CREATE, so the opener can refresh and close. */
  onPublished?: () => void
  /** Reports unsaved changes upward so the modal can warn before closing. */
  onDirtyChange?: (dirty: boolean) => void
}) {
  const isEdit = !!initial
  const action = isEdit ? updateWorkPost : createWorkPost
  const [state, formAction, pending] = useActionState<WorkFormState, FormData>(action, {})

  const { user } = useUser()
  const side: PostSide = user?.role === 'RECRUITER' ? 'RECRUITER' : 'PROFESSIONAL'
  const options = useMemo(() => responsesForSide(side), [side])

  const [desiredResponse, setDesiredResponse] = useState<ResponseType>(
    initial?.desiredResponse ?? options[0]
  )

  // Media: an image OR a YouTube link, never both. Picking one clears the other
  // so the two inputs can never disagree about what the post is.
  const [mediaUrl, setMediaUrl] = useState<string | null>(initial?.mediaUrl ?? null)
  const [videoUrl, setVideoUrl] = useState<string>(initial?.videoUrl ?? '')
  const [applyUrl, setApplyUrl] = useState<string>(initial?.applyUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const { formRef, isDirty } = useFormDirty(true)
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])
  useEffect(() => {
    if (state?.ok) onDirtyChange?.(false)
  }, [state, onDirtyChange])
  const [uploadError, setUploadError] = useState<string | null>(null)
  // Which frame the post is shown in. Auto-detected from the image on upload so
  // the user confirms rather than guesses; still overridable.
  const [aspect, setAspect] = useState<AspectRatio>(
    parseAspect(initial?.aspect ?? '9:16')
  )

  const embed = videoUrl ? youtubeEmbed(videoUrl) : null
  const videoInvalid = videoUrl.trim().length > 0 && !embed
  // Media is required for a PROFESSIONAL post (it is work - something must be
  // shown) and optional for a RECRUITING post, which can be a caption on a
  // background. At most one of the two, always.
  const hasMedia = Boolean(mediaUrl) || Boolean(embed)
  const mediaRequired = side !== 'RECRUITER'

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body })
      const json = await res.json()
      if (!res.ok) {
        setUploadError(json?.error ?? 'Upload failed.')
        return
      }
      setMediaUrl(json.url)
      setVideoUrl('') // image and video are exclusive

      // Preselect the frame that matches the file, so an already-9:16 image is
      // filed as 9:16 without the user having to work it out.
      try {
        const probe = new Image()
        probe.src = json.url
        await probe.decode()
        if (probe.naturalWidth && probe.naturalHeight) {
          setAspect(nearestAspect(probe.naturalWidth / probe.naturalHeight))
        }
      } catch {
        // Detection is a convenience - a failure leaves the current choice.
      }
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // A successful create returns { ok: true } instead of redirecting. Tell the
  // opener so it can clear the cached feed and close the modal.
  useEffect(() => {
    if (isEdit || !state.ok) return
    // Hand the freshly created post to the feed so it appears at the TOP the
    // instant the modal closes - no waiting for the `/api/home` refetch.
    if (state.createdPost) setPendingPost(state.createdPost)
    onPublished?.()
  }, [isEdit, state.ok, state.createdPost, onPublished])

  // Values echoed back after a failed save, so a validation error does not wipe
  // everything the user typed.
  const v = state.values
  const dv = (field: string, fallback?: string) => v?.[field] ?? fallback

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="postId" value={initial!.id} />}
      <input type="hidden" name="desiredResponse" value={desiredResponse} />
      <input type="hidden" name="mediaUrl" value={mediaUrl ?? ''} />
      <input type="hidden" name="aspect" value={aspect} />
      <input type="hidden" name="videoUrl" value={videoUrl} />
      <input type="hidden" name="applyUrl" value={applyUrl} />

      <Field
        label="Caption"
        name="caption"
        defaultValue={dv('caption', initial?.caption ?? undefined)}
        placeholder="Tell people what this is"
        textarea
      />

      {/* MEDIA - image or YouTube, mutually exclusive, REQUIRED */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Image or video
        </label>

        {mediaUrl ? (
          <div className="relative overflow-hidden rounded-lg border border-[#e5e5e5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl} alt="Selected" className="max-h-72 w-full object-cover" />
            <button
              type="button"
              onClick={() => setMediaUrl(null)}
              className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white"
            >
              Remove
            </button>
          </div>
        ) : embed ? (
          <div className="relative overflow-hidden rounded-lg border border-[#e5e5e5] bg-black">
            <iframe
              src={embed}
              title="Video preview"
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              type="button"
              onClick={() => setVideoUrl('')}
              className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="media"
              className={`flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-line px-4 py-6 text-sm text-ink-muted transition-colors hover:bg-surface-sunken ${
                uploading ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              {uploading ? 'Uploading…' : 'Click to add an image'}
              <input
                id="media"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onPickFile}
                disabled={uploading}
                className="sr-only"
              />
            </label>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="h-px flex-1 bg-[#e5e5e5]" /> or <span className="h-px flex-1 bg-[#e5e5e5]" />
            </div>

            <div>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value)
                  if (e.target.value) setMediaUrl(null) // exclusive
                }}
                placeholder="Paste a YouTube link"
                className="w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-near-black/10"
              />
              {videoInvalid && (
                <p className="mt-1 text-xs text-red-600">
                  That does not look like a YouTube link.
                </p>
              )}
            </div>
          </div>
        )}

        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}

        {/* FRAME - only meaningful once there is an image. Videos keep their
            own 16:9 embed and ignore this. */}
        {mediaUrl && (
          <div>
            <span className="block text-sm font-medium mb-1">Frame</span>
            <div className="grid grid-cols-2 gap-2">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspect(r)}
                  aria-pressed={aspect === r}
                  className={`cursor-pointer rounded-xl border p-3 text-center transition-colors ${
                    aspect === r
                      ? 'border-brand bg-brand-light/40'
                      : 'border-line hover:bg-surface-sunken'
                  }`}
                >
                  <div className={`mb-2 flex h-12 items-center justify-center ${aspect === r ? 'text-brand' : 'text-ink-subtle'}`}>
                    <span
                      className={
                        r === '9:16'
                          ? 'h-11 w-[25px] rounded-[3px] border-2 border-current'
                          : 'h-[25px] w-11 rounded-[3px] border-2 border-current'
                      }
                    />
                  </div>
                  <div className="text-[15px] font-bold text-ink">{r}</div>
                  <div className="mt-1 text-[11px] text-ink-subtle">
                    {r === '9:16' ? 'portrait' : 'landscape'}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Images close to the frame fill it edge to edge. Other shapes keep
              their own proportions on a blurred background.
            </p>
          </div>
        )}
      </div>

      {/* WHAT DO YOU WANT BACK? - a dropdown, not a grid of buttons. */}
      <div>
        <label htmlFor="desiredResponseSelect" className="block text-sm font-medium mb-1">
          What response do you want?
        </label>
        <select
          id="desiredResponseSelect"
          value={desiredResponse}
          onChange={(e) => setDesiredResponse(e.target.value as ResponseType)}
          className="w-full px-4 py-2 border border-[#e5e5e5] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-near-black/10"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {composerLabel(opt, side)}
            </option>
          ))}
        </select>

        {/* APPLY is not a document handover and not a message - it needs a
            destination. Asked for here so the CTA can send applicants out. */}
        {desiredResponse === 'APPLY' && (
          <div className="mt-3">
            <label htmlFor="applyUrlInput" className="block text-sm font-medium mb-1">
              Application link
            </label>
            <input
              id="applyUrlInput"
              type="url"
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
              placeholder="https://... where people should apply"
              className="w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-near-black/10"
            />
          </div>
        )}
      </div>

      {state.error && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-md">
          <p className="text-sm font-medium text-red-700">{state.error}</p>
          {state.reason && <p className="text-sm text-red-600 mt-1">{state.reason}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || videoInvalid || (mediaRequired && !hasMedia)}
        className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? (isEdit ? 'Saving...' : 'Publishing...') : isEdit ? 'Save changes' : 'Publish'}
      </button>
    </form>
  )
}

export { WorkForm as NewWorkForm }
