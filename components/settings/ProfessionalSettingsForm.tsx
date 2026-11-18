'use client'

import { useActionState, useState, useEffect } from 'react'
import { useSWRConfig } from 'swr'
import { updateProfessionalProfile, type ProfileFormState } from '@/app/(app)/profile/settings/actions'
import { ExperienceFields, type ExperienceEntry } from '@/components/settings/ExperienceFields'
import { CharCounter } from '@/components/settings/CharCounter'
import { BIO_MAX, ABOUT_MAX } from '@/lib/profile/limits'

type Props = {
  username: string
  name: string
  title: string
  bio: string
  location: string
  country: string
  availability: string
  skills: string[]
  linkedinUrl: string
  twitterUrl: string
  githubUrl: string
  websiteUrl: string
  contactEmail: string
  experiences: ExperienceEntry[]
}

const availabilityOptions = [
  { value: 'OPEN_TO_WORK', label: 'Open to work' },
  { value: 'OPEN_TO_CONTRACT', label: 'Open to contract' },
  { value: 'OPEN_TO_FREELANCE', label: 'Open to freelance' },
  { value: 'OPEN_TO_FULL_TIME', label: 'Open to full-time' },
  { value: 'OPEN_TO_OPPORTUNITIES', label: 'Open to opportunities' },
  { value: 'NOT_AVAILABLE', label: 'Not currently available' },
]

export function ProfessionalSettingsForm(props: Props) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateProfessionalProfile,
    {}
  )

  const { mutate } = useSWRConfig()

  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameValue, setUsernameValue] = useState(props.username)
  // Bio/About are capped, so track their length for the counter. `title` is the
  // BIO field and `bio` is the ABOUT field (labels were swapped long ago).
  const [bioValue, setBioValue] = useState(props.title ?? '')
  const [aboutValue, setAboutValue] = useState(props.bio ?? '')

  useEffect(() => {
    setBioValue(props.title ?? '')
    setAboutValue(props.bio ?? '')
  }, [props.title, props.bio])

  useEffect(() => {
    setUsernameValue(props.username)
  }, [props.username])

  useEffect(() => {
    if (state?.ok) {
      setEditingUsername(false)
      // The sidebar renders from /api/me, which lives in the SWR cache. The
      // server action's revalidatePath does not touch that cache, so the
      // status line stayed stale until a reload without this.
      mutate('/api/me')
    }
  }, [state, mutate])

  const inputClass =
    'w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-near-black/10'

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
        <input id="name" name="name" type="text" defaultValue={props.name} required className={inputClass} />
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
            className={`${inputClass} pl-8 ${
              editingUsername ? '' : 'bg-surface-sunken text-ink-subtle cursor-pointer'
            }`}
          />
        </div>
      </div>

      <div>
        {/* LABEL NOTE: the field stored as `title` is labelled "Bio", and the
            field stored as `bio` is labelled "About". The labels were renamed
            on request; the database columns were NOT. Keep that in mind when
            editing - `name="title"` is the Bio box. */}
        <label htmlFor="title" className="block text-sm font-medium mb-1">Bio</label>
        <input
          id="title"
          name="title"
          type="text"
          value={bioValue}
          onChange={(e) => setBioValue(e.target.value)}
          maxLength={BIO_MAX}
          placeholder="e.g. Product Designer"
          className={inputClass}
        />
        <CharCounter length={bioValue.length} max={BIO_MAX} />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-1">About</label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={aboutValue}
          onChange={(e) => setAboutValue(e.target.value)}
          maxLength={ABOUT_MAX}
          placeholder="A short summary of what you do."
          className={inputClass}
        />
        <CharCounter length={aboutValue.length} max={ABOUT_MAX} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">City</label>
          <input id="location" name="location" type="text" defaultValue={props.location} placeholder="e.g. Lagos" className={inputClass} />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
          <input id="country" name="country" type="text" defaultValue={props.country} placeholder="e.g. Nigeria" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="availability" className="block text-sm font-medium mb-1">Availability</label>
        <select id="availability" name="availability" defaultValue={props.availability} className={`${inputClass} bg-white`}>
          {availabilityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-medium mb-1">Skills</label>
        <input id="skills" name="skills" type="text" defaultValue={props.skills.join(', ')} placeholder="Comma-separated, e.g. UX Design, Figma" className={inputClass} />
        <p className="text-xs text-gray-500 mt-1">Separate skills with commas.</p>
      </div>

      <div className="border-t border-[#e5e5e5] pt-6">
        <h3 className="text-sm font-semibold mb-1">Social Links</h3>
        <p className="text-xs text-gray-500 mb-4">
          At least one social link is required. These help recruiters reach you.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium mb-1">LinkedIn</label>
            <input id="linkedinUrl" name="linkedinUrl" type="text" defaultValue={props.linkedinUrl} placeholder="linkedin.com/in/yourname" className={inputClass} />
          </div>
          <div>
            <label htmlFor="twitterUrl" className="block text-sm font-medium mb-1">X / Twitter</label>
            <input id="twitterUrl" name="twitterUrl" type="text" defaultValue={props.twitterUrl} placeholder="x.com/yourname" className={inputClass} />
          </div>
          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium mb-1">GitHub</label>
            <input id="githubUrl" name="githubUrl" type="text" defaultValue={props.githubUrl} placeholder="github.com/yourname" className={inputClass} />
          </div>
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium mb-1">Website</label>
            <input id="websiteUrl" name="websiteUrl" type="text" defaultValue={props.websiteUrl} placeholder="yourname.com" className={inputClass} />
          </div>
        </div>
      </div>

      <ExperienceFields initial={props.experiences} inputClass={inputClass} />

      <div className="border-t border-[#e5e5e5] pt-6">
        <label htmlFor="contactEmail" className="block text-sm font-medium mb-1">Contact Email (optional)</label>
        <input id="contactEmail" name="contactEmail" type="email" defaultValue={props.contactEmail} placeholder="Where recruiters should reach you (defaults to your account email)" className={inputClass} />
        <p className="text-xs text-gray-500 mt-1">Not shown publicly. Used only when a recruiter sends you a message.</p>
      </div>

      {/* Feedback sits directly ABOVE the Save button: the eye is already
          there when the user clicks, so a validation error cannot be missed. */}
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

      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
        {pending ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  )
}
