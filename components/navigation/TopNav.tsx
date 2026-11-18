'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/client/fetcher'
import { seedCache } from '@/lib/client/use-cached'
import { initialsOf } from '@/lib/client/social'
import { useCached } from '@/lib/client/use-cached'
import {
  UserIcon,
  BriefcaseIcon,
  ChatIcon,
  BellIcon,
  BookmarkIcon,
  SettingsIcon,
  ChevronIcon,
  HomeIcon,
  SearchIcon,
  CompassIcon,
  TrendingIcon,
  EyeIcon,
} from '@/components/icons'

type Role = 'PROFESSIONAL' | 'RECRUITER' | 'ADMIN'

const menuItems = [
  { name: 'Profile', href: '/profile', icon: UserIcon, api: '/api/me' },
  { name: 'Messages', href: '/messages', icon: ChatIcon, api: '/api/messages' },
  { name: 'Notifications', href: '/profile/notifications', icon: BellIcon, api: '/api/notifications' },
  { name: 'Saved Work', href: '/profile/saved-work', icon: BookmarkIcon },
  { name: 'Professionals', href: '/profile/saved-professionals', icon: BriefcaseIcon },
  { name: 'My list', href: '/list', icon: UserIcon },
  { name: 'Boost Visibility', href: '/profile/visibility', icon: EyeIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon, api: '/api/me' },
]

const primaryNav = [
  { name: 'Home', href: '/feed', icon: HomeIcon },
  { name: 'Jobs', href: '/recruitments', icon: BriefcaseIcon },
  { name: 'Professionals', href: '/profile/professionals', icon: UserIcon },
  { name: 'Recruiters', href: '/profile/recruiters', icon: BriefcaseIcon },
  { name: 'Explore', href: '/explore', icon: CompassIcon },
  { name: 'Trending', href: '/trending', icon: TrendingIcon },
]

export function TopNav({ role, userName }: { role: Role; userName?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [query, setQuery] = useState('')

  const { data: unread } = useCached<{ totalUnread: number }>('/api/unread')
  const unreadCount = unread?.totalUnread ?? 0

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const prefetch = (api?: string) => {
    if (!api) return
    fetcher(api)
      .then((d) => seedCache(api, d))
      .catch(() => {})
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore')
  }

  return (
    <header className="relative z-30 border-b border-line bg-white">
      {menuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />,
          document.body
        )}

      <div className="mx-auto flex w-full max-w-[1560px] items-center gap-4 px-5 py-4">
        {/* Brand */}
        <Link href="/feed" className="flex flex-shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-[17px] font-bold text-white shadow-[0_4px_12px_rgba(91,61,245,0.24)]">
            P
          </span>
          <span className="hidden text-[17px] font-bold tracking-tight text-ink sm:block">
            Positioned
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-[14px] font-medium transition-colors ${
                  active
                    ? 'bg-brand-light text-ink'
                    : 'text-ink hover:bg-surface-sunken'
                }`}
              >
                <Icon className="h-[17px] w-[17px]" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Search */}
        <form onSubmit={submitSearch} className="ml-auto hidden max-w-[340px] flex-1 md:block">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, jobs, or skills..."
              className="w-full rounded-xl border border-transparent bg-surface-sunken py-2.5 pl-10 pr-4 text-[14px] text-ink placeholder:text-ink-subtle transition-colors focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/10"
            />
          </div>
        </form>

        {/* Icon cluster */}
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href="/profile/notifications"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <BellIcon className="h-[19px] w-[19px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/messages"
            aria-label="Messages"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <ChatIcon className="h-[19px] w-[19px]" />
          </Link>

          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              onMouseEnter={() => prefetch('/api/me')}
              aria-label="Account menu"
              className="flex items-center gap-1 rounded-xl p-0.5 transition-colors hover:bg-surface-sunken"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-[12px] font-bold text-ink">
                {initialsOf(userName)}
              </span>
              <ChevronIcon direction="down" className="h-3.5 w-3.5 text-ink-muted" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-pop">
                {userName && (
                  <div className="border-b border-line px-4 py-2.5">
                    <p className="truncate text-[14px] font-semibold text-ink">{userName}</p>
                    <p className="text-[12px] text-ink-subtle">Signed in</p>
                  </div>
                )}
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-[14px] text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {item.name}
                    </Link>
                  )
                })}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="mt-1 w-full border-t border-line px-4 py-2 text-left text-[14px] text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
                >
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
