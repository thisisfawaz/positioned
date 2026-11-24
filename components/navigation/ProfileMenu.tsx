'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { initialsOf } from '@/lib/client/social'
import { UserIcon } from '@/components/icons'

/**
 * The signed-in user's avatar at the bottom of the sidebar. Clicking it opens a
 * small dropdown with "View profile" and "Sign out".
 *
 * Sign out reuses the existing Supabase client sign-out (same behaviour as the
 * old SignOutButton): clear the session, then send the user to /auth/login and
 * refresh so server components drop the stale session.
 *
 * The menu opens UPWARD (it sits at the bottom of the rail) and closes on an
 * outside click or Escape.
 */
export function ProfileMenu({
  name,
  subtitle,
  profileHref,
  photo,
}: {
  name: string | null | undefined
  subtitle: string
  profileHref: string
  photo?: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div ref={wrapRef} className="relative mt-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex w-full items-center gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-surface-sunken"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-[12px] font-bold text-ink">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={name ?? 'Profile'} className="h-full w-full object-cover" />
          ) : name ? (
            initialsOf(name)
          ) : (
            <UserIcon className="h-4 w-4" />
          )}
        </span>
        <span className="hidden min-w-0 flex-1 text-left xl:block">
          <span className="block truncate text-[14px] font-semibold text-ink">
            {name ?? 'Your profile'}
          </span>
          <span className="block truncate text-[12px] text-ink-subtle">{subtitle}</span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-50 mb-2 w-56 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-pop"
        >
          <div className="border-b border-line px-4 py-2.5">
            <p className="truncate text-[14px] font-semibold text-ink">
              {name ?? 'Your profile'}
            </p>
            <p className="truncate text-[12px] text-ink-subtle">{subtitle}</p>
          </div>
          <Link
            href={profileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-[14px] text-ink-muted transition-colors hover:bg-[#242424] hover:text-ink"
          >
            <UserIcon className="h-4 w-4 flex-shrink-0" />
            View profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full border-t border-line px-4 py-2 text-left text-[14px] text-rose-600 transition-colors hover:bg-[#242424] disabled:opacity-60"
          >
            {signingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
