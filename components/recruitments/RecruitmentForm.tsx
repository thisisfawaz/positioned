'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormDirty } from '@/lib/client/use-form-dirty'
import {
  createRecruitment,
  updateRecruitment,
  type RecruitmentFormState,
} from '@/app/(app)/profile/recruitments/actions'
import { youtubeEmbedUrl as youtubeEmbed } from '@/lib/client/youtube'

type Initial = {
  id?: string
  title?: string
  organization?: string
  location?: string
  country?: string
  employmentType?: string
  description?: string
  responsibilities?: string
  requirements?: string
  salaryRange?: string
  salaryHidden?: boolean
  applyMethod?: string
  applyInstructions?: string
  applyUrl?: string
  closingDate?: string
}

type ApplyMethod = 'LINK' | 'DM' | 'EMAIL'

const applyMethods: { value: ApplyMethod; label: string; hint: string }[] = [
  { value: 'LINK', label: 'Apply to link', hint: 'Applicants open an external link. Shows as "Apply".' },
  { value: 'DM', label: 'Send DM', hint: 'Applicants message you here. Shows as "Send DM".' },
  { value: 'EMAIL', label: 'Send Email', hint: 'Applicants email you. Shows as "Send Email".' },
]

export function RecruitmentForm({
  initial,
  initialEmploymentType,
  onDirtyChange,
}: {
  initial?: Initial
  initialEmploymentType?: string
  /** Reports unsaved changes upward so the modal can warn before closing. */
  onDirtyChange?: (dirty: boolean) => void
}) {
  const isEdit = Boolean(initial?.id)

  // TEAM MODE REMOVED (2026-11-17). Posting a job is now like any other post:
  // one recruitment post, with any number of roles written into the description.
  const action = isEdit ? updateRecruitment : createRecruitment

  const [state, formAction, pending] = useActionState<
    RecruitmentFormState,
    FormData
  >(action, {})

  // MEDIA - an image OR a YouTube link, never both. Mirrors NewWorkForm so
  // recruiters get exactly the professional posting rule.
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { formRef, isDirty } = useFormDirty(true)
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])
  useEffect(() => {
    if (state?.ok) onDirtyChange?.(false)
  }, [state, onDirtyChange])

  const embed = videoUrl ? youtubeEmbed(videoUrl) : null
  const videoInvalid = videoUrl.trim().length > 0 && !embed
  const hasMedia = Boolean(mediaUrl) || Boolean(embed)

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
      setVideoUrl('') // exclusive
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const [salaryHidden, setSalaryHidden] = useState(Boolean(initial?.salaryHidden))
  const [applyMethod, setApplyMethod] = useState<ApplyMethod>(
    (initial?.applyMethod as ApplyMethod) || 'LINK'
  )
  // Values echoed back after a failed save. Uncontrolled inputs are reset by
  // React after every server action, so without this a validation or DB error
  // wipes this long form.
  const v = state.values
  const dv = (field: string, fallback?: string) => v?.[field] ?? fallback

  const inputClass =
    'w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-brand/30'

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}
      <input type="hidden" name="salaryHidden" value={salaryHidden ? 'true' : 'false'} />
      <input type="hidden" name="applyMethod" value={applyMethod} />
      <input type="hidden" name="imageUrl" value={mediaUrl ?? ''} />
      <input type="hidden" name="videoUrl" value={videoUrl} />

      {/* MEDIA - image or YouTube, mutually exclusive. REQUIRED: Publish stays
          disabled until the post has media, exactly like a professional post. */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Image or video</label>

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
                className={inputClass}
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
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">Job Title</label>
        <input id="title" name="title" type="text" required defaultValue={dv('title', initial?.title || '')} placeholder="e.g. Senior Product Designer" className={inputClass} />
      </div>

      {/* Shared fields. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="organization" className="block text-sm font-medium mb-1">Organization</label>
          <input id="organization" name="organization" type="text" defaultValue={dv('organization', initial?.organization || '')} placeholder="e.g. Acme Inc." className={inputClass} />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
          <input id="location" name="location" type="text" defaultValue={dv('location', initial?.location || '')} placeholder="e.g. Remote" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
        <input id="country" name="country" type="text" defaultValue={dv('country', initial?.country || '')} placeholder="e.g. Nigeria" className={inputClass} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium mb-1">Employment Type</label>
            <select
              id="employmentType"
              name="employmentType"
              defaultValue={dv('employmentType', initial?.employmentType || initialEmploymentType || '')}
              className={inputClass}
            >
              <option value="">Select…</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div>
            <label htmlFor="salaryRange" className="block text-sm font-medium mb-1">Salary Range</label>
            {salaryHidden ? (
              <div className="flex items-center justify-between gap-2 px-4 py-2 border border-dashed border-[#e5e5e5] rounded-md text-sm text-gray-500">
                <span>Prefer not to say</span>
                <button
                  type="button"
                  onClick={() => setSalaryHidden(false)}
                  className="text-xs font-semibold text-ink hover:underline"
                >
                  Add salary
                </button>
              </div>
            ) : (
              <>
                <input id="salaryRange" name="salaryRange" type="text" defaultValue={dv('salaryRange', initial?.salaryRange || '')} placeholder="e.g. $80k – $110k" className={inputClass} />
                <button
                  type="button"
                  onClick={() => setSalaryHidden(true)}
                  className="mt-1 text-xs font-semibold text-gray-500 hover:text-near-black"
                >
                  Prefer not to say
                </button>
              </>
            )}
          </div>
        </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
        <textarea id="description" name="description" rows={5} defaultValue={dv('description', initial?.description || '')} placeholder="What the role involves. For several roles, list them here." className={inputClass} />
      </div>

      <div>
        <label htmlFor="responsibilities" className="block text-sm font-medium mb-1">Responsibilities</label>
        <textarea id="responsibilities" name="responsibilities" rows={4} defaultValue={dv('responsibilities', initial?.responsibilities || '')} placeholder="Day-to-day duties of the role." className={inputClass} />
      </div>

      <div>
        <label htmlFor="requirements" className="block text-sm font-medium mb-1">Requirements</label>
        <textarea id="requirements" name="requirements" rows={4} defaultValue={dv('requirements', initial?.requirements || '')} placeholder="Skills and experience required." className={inputClass} />
      </div>

      <div>
        <label htmlFor="applyInstructions" className="block text-sm font-medium mb-1">How to apply</label>
        <textarea
          id="applyInstructions"
          name="applyInstructions"
          rows={3}
          defaultValue={dv('applyInstructions', initial?.applyInstructions || '')}
          placeholder="e.g. Upload your CV and send it to the email below."
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-1">Free-text instructions shown on the post.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">How should people apply?</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {applyMethods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setApplyMethod(m.value)}
              className={`p-3 border rounded-lg text-left transition-colors ${
                applyMethod === m.value
                  ? 'border-near-black bg-surface-sunken'
                  : 'border-line hover:bg-surface-sunken'
              }`}
            >
              <div className="font-semibold text-sm">{m.label}</div>
              <div className="text-xs text-gray-600 mt-1">{m.hint}</div>
            </button>
          ))}
        </div>

        {applyMethod === 'LINK' && (
          <div className="mt-3">
            <label htmlFor="applyUrl" className="block text-sm font-medium mb-1">Application Link</label>
            <input id="applyUrl" name="applyUrl" type="url" defaultValue={dv('applyUrl', initial?.applyUrl || '')} placeholder="https://example.com/apply" className={inputClass} />
            <p className="text-xs text-gray-500 mt-1">Applicants see "Apply" and open this link in a new tab.</p>
          </div>
        )}

        {applyMethod === 'DM' && (
          <p className="mt-3 text-xs text-gray-500">
            Applicants see "Send DM" and start a message with you on Positioned.Pro.
          </p>
        )}

        {applyMethod === 'EMAIL' && (
          <div className="mt-3">
            <label htmlFor="contactEmail" className="block text-sm font-medium mb-1">Contact Email</label>
            <input id="contactEmail" name="applyUrl" type="email" defaultValue={dv('applyUrl', initial?.applyUrl || '')} placeholder="hiring@example.com" className={inputClass} />
            <p className="text-xs text-gray-500 mt-1">Applicants see "Send Email" and open their mail app.</p>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="closingDate" className="block text-sm font-medium mb-1">Closing Date</label>
        <input id="closingDate" name="closingDate" type="date" defaultValue={dv('closingDate', initial?.closingDate || '')} className={inputClass} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      {/* Publish is DISABLED until the post is complete: media present and no
          invalid video link. Same rule as the professional composer. */}
      <button
        type="submit"
        disabled={pending || !hasMedia || videoInvalid}
        className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Publish role'}
      </button>
    </form>
  )
}
