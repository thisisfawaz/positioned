'use client'

import { useActionState, useState, useEffect } from 'react'
import { useSWRConfig } from 'swr'
import { updateRecruiterProfile, type ProfileFormState } from '@/app/(app)/profile/settings/actions'
import { ExperienceFields, type ExperienceEntry } from '@/components/settings/ExperienceFields'
import { CharCounter } from '@/components/settings/CharCounter'
import { ProfilePhotoPicker } from '@/components/settings/ProfilePhotoPicker'
import { useFormDirty } from '@/lib/client/use-form-dirty'
import { ABOUT_MAX, NAME_MAX, USERNAME_MAX, usernameError } from '@/lib/profile/limits'

type Props = {
  username: string
  name: string
  organization: string
  bio: string
  location: string
  hiringInterests: string
  website: string
  contactEmail: string
  recruitingStatus: string
  experiences: ExperienceEntry[]
  profilePhoto?: string | null
  /** Reports unsaved changes upward so the modal can warn before closing. */
  onDirtyChange?: (dirty: boolean) => void
}

const statusOptions = [
  { value: 'CURRENTLY_RECRUITING', label: 'Currently recruiting' },
  { value: 'NOT_RECRUITING', label: 'Not recruiting' },
]

export function RecruiterSettingsForm(props: Props) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateRecruiterProfile,
    {}
  )

  const { mutate } = useSWRConfig()

  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameValue, setUsernameValue] = useState(props.username)
  const [nameValue, setNameValue] = useState(props.name ?? '')
  const usernameErr = usernameError(usernameValue)
  // About is capped - track its length for the counter.
  const [aboutValue, setAboutValue] = useState(props.bio ?? '')

  useEffect(() => {
    setUsernameValue(props.username)
  }, [props.username])

  useEffect(() => {
    setNameValue(props.name ?? '')
  }, [props.name])

  useEffect(() => {
    setAboutValue(props.bio ?? '')
  }, [props.bio])

  useEffect(() => {
    if (state?.ok) {
      setEditingUsername(false)
      // Keeps the sidebar's status line in sync - see the note in
      // ProfessionalSettingsForm.
      mutate('/api/me')
    }
  }, [state, mutate])

  // Theme tokens, not literals: `border-[#e5e5e5]` is light-only and a white
  // fill punched bright holes through the dark modal.
  const inputClass =
    'w-full rounded-md border border-line bg-[var(--modal)] px-4 py-2 text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20'

  const { formRef, isDirty } = useFormDirty(true)
  useEffect(() => {
    props.onDirtyChange?.(isDirty)
  }, [isDirty, props])
  useEffect(() => {
    if (state?.ok) props.onDirtyChange?.(false)
  }, [state, props])

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <ProfilePhotoPicker
        initialUrl={props.profilePhoto ?? null}
        displayName={props.name}
      />

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          maxLength={NAME_MAX}
          required
          className={inputClass}
        />
        <CharCounter length={nameValue.length} max={NAME_MAX} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="username" className="block text-sm font-medium">Username</label>
          {!editingUsername && (
            <button
              type="button"
              onClick={() => setEditingUsername(true)}
              className="text-sm font-medium text-ink hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
          <input
            id="username"
            name="username"
            type="text"
            value={usernameValue}
            onChange={(e) => setUsernameValue(e.target.value)}
            placeholder="yourhandle"
            readOnly={!editingUsername}
            maxLength={USERNAME_MAX}
            className={`${inputClass} pl-8 ${
              editingUsername ? '' : 'bg-surface-sunken text-ink-subtle cursor-pointer'
            }`}
          />
        </div>
        {editingUsername && (
          <>
            {usernameErr && (
              <p className="mt-1 text-[12px] text-rose-600">{usernameErr}</p>
            )}
            <CharCounter length={usernameValue.replace(/^@/, '').length} max={USERNAME_MAX} />
          </>
        )}
      </div>

      <div>
        <label htmlFor="organization" className="block text-sm font-medium mb-1">Organization</label>
        <input id="organization" name="organization" type="text" defaultValue={props.organization}
          placeholder="e.g. Acme Inc."
          className={inputClass} />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-1">About</label>
        <textarea id="bio" name="bio" rows={4} value={aboutValue}
          onChange={(e) => setAboutValue(e.target.value)}
          maxLength={ABOUT_MAX}
          placeholder="A short summary of you and what you hire for."
          className={inputClass} />
        <CharCounter length={aboutValue.length} max={ABOUT_MAX} />
      </div>

      <div>
        <label htmlFor="recruitingStatus" className="block text-sm font-medium mb-1">Status</label>
        <select id="recruitingStatus" name="recruitingStatus" defaultValue={props.recruitingStatus}
          className={inputClass}>
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
        <input id="location" name="location" type="text" defaultValue={props.location}
          placeholder="e.g. Lagos, Nigeria"
          className={inputClass} />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium mb-1">Website (optional)</label>
        <input id="website" name="website" type="text" defaultValue={props.website} placeholder="yourcompany.com" className={inputClass} />
        <p className="text-xs text-gray-500 mt-1">
          A link to your website. Once added it appears as a button on your profile.
        </p>
      </div>

      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium mb-1">Contact Email (optional)</label>
        <input id="contactEmail" name="contactEmail" type="email" defaultValue={props.contactEmail} placeholder="hiring@example.com" className={inputClass} />
        <p className="text-xs text-gray-500 mt-1">
          Shown in your profile Contact tab so people can reach you.
        </p>
      </div>

      <div>
        <label htmlFor="hiringInterests" className="block text-sm font-medium mb-1">Hiring Interests</label>
        <textarea id="hiringInterests" name="hiringInterests" rows={4} defaultValue={props.hiringInterests}
          placeholder="What kind of roles and skills are you hiring for?"
          className={inputClass} />
      </div>

      <ExperienceFields
        initial={props.experiences}
        inputClass={inputClass}
      />

      {/* Feedback sits directly ABOVE the Save button, matching the
          professional form. */}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Profile saved.
        </p>
      )}

      <button type="submit" disabled={pending}
        className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
        {pending ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  )
}
