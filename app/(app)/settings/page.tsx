'use client'

import { useState } from 'react'
import { useCached } from '@/lib/client/use-cached'
import { ProfileEditModal } from '@/components/profile/ProfileEditModal'
import { THEME_STORAGE_KEY } from '@/components/providers/ThemeProvider'

type ThemeMode = 'light' | 'dark' | 'system'

type Settings = {
  notifyMessages: boolean
  notifyList: boolean
  notifyRoles: boolean
  profileVisible: boolean
  allowRecruiterMessages: boolean
  themeMode: ThemeMode
}

const NOTIFICATION_ROWS: { key: keyof Settings; label: string }[] = [
  { key: 'notifyMessages', label: 'New messages' },
  { key: 'notifyList', label: 'Someone adds me to their list' },
  { key: 'notifyRoles', label: 'New roles matching my interests' },
]

const PRIVACY_ROWS: { key: keyof Settings; label: string }[] = [
  { key: 'profileVisible', label: 'Show my profile in search' },
  { key: 'allowRecruiterMessages', label: 'Allow recruiters to message me' },
]

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-brand' : 'bg-surface-sunken'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      {hint && <p className="mt-1 text-[13px] text-ink-subtle">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function SettingsPage() {
  const { data, mutate } = useCached<{ settings: Settings }>('/api/settings')
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const settings = data?.settings

  async function update(key: keyof Settings, value: boolean | ThemeMode) {
    if (!settings) return
    setError(null)
    setSaving(key)

    // Optimistic: show the new state immediately, roll back on failure.
    const previous = settings
    await mutate({ settings: { ...settings, [key]: value } }, false)

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
      if (!res.ok) throw new Error('save failed')
      const json = await res.json()
      await mutate({ settings: json.settings }, false)

      // Mirror the theme locally so the next page load applies it before paint.
      if (key === 'themeMode') {
        window.localStorage.setItem(THEME_STORAGE_KEY, String(value))
        document.documentElement.classList.toggle(
          'dark',
          value === 'dark' ||
            (value === 'system' &&
              window.matchMedia('(prefers-color-scheme: dark)').matches)
        )
      }
    } catch {
      await mutate({ settings: previous }, false)
      setError('Could not save that change. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="w-full px-3 pb-6 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-[26px]">Settings</h1>
        <p className="mt-1 text-[14px] text-ink-muted">Account and app preferences.</p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-[13px] text-red-600">{error}</p>
      )}

      <div className="max-w-[720px] space-y-3">
        <Section title="Account">
          <div className="space-y-3">
            <div>
              <p className="text-[14px] font-medium text-ink">Email</p>
              <p className="text-[13px] text-ink-subtle">Used to sign in. Contact support to change it.</p>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
              <div>
                <p className="text-[14px] font-medium text-ink">Profile details</p>
                <p className="text-[13px] text-ink-subtle">Name, bio, skills, links.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="rounded-xl border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink transition-colors hover:bg-surface-sunken"
              >
                Edit profile
              </button>
            </div>
          </div>
        </Section>

        <Section title="Notifications" hint="Stored now; delivery is not built yet.">
          <ul className="space-y-3">
            {NOTIFICATION_ROWS.map((row) => (
              <li key={row.key} className="flex items-center justify-between gap-4">
                <span className="text-[14px] text-ink">{row.label}</span>
                <Toggle
                  checked={Boolean(settings?.[row.key])}
                  onChange={(v) => update(row.key, v)}
                  disabled={!settings || saving === row.key}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Privacy"
          hint="Saved now; these take effect once the search and messaging checks are wired."
        >
          <ul className="space-y-3">
            {PRIVACY_ROWS.map((row) => (
              <li key={row.key} className="flex items-center justify-between gap-4">
                <span className="text-[14px] text-ink">{row.label}</span>
                <Toggle
                  checked={Boolean(settings?.[row.key])}
                  onChange={(v) => update(row.key, v)}
                  disabled={!settings || saving === row.key}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Appearance"
          hint="Light and dark invert the main surfaces. Some older pages may still show light panels until they are swept."
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-[14px] text-ink">Theme</span>
            <select
              value={settings?.themeMode ?? 'light'}
              onChange={(e) => update('themeMode', e.target.value as ThemeMode)}
              disabled={!settings || saving === 'themeMode'}
              className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-[14px] text-ink"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </Section>
      </div>

      <ProfileEditModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
