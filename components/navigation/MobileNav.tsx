'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/client/use-user'
import { useCached } from '@/lib/client/use-cached'
import { initialsOf } from '@/lib/client/social'
import {
  HomeIcon,
  CompassIcon,
  PlusIcon,
  BellIcon,
  CloseIcon,
} from '@/components/icons'
import { CreatePostTrigger } from '@/components/work/CreatePostTrigger'
import { ProfileMenu } from '@/components/navigation/ProfileMenu'
import { NAV_ITEMS } from '@/components/navigation/navItems'
import { REEL_SCROLL_EVENT, type ReelScrollDetail } from '@/lib/client/reel-scroll'

/**
 * Mobile chrome. The top brand bar has been removed: on mobile the bottom tab
 * bar is the only chrome. The tab bar carries Home, Explore, a raised Create
 * button, Notifications, and the user's PROFILE PHOTO in place of the old
 * Messages tab. Tapping the photo opens a DRAWER containing the same nav as the
 * desktop sidebar (NAV_ITEMS) plus a ProfileMenu (View profile / Sign out), so
 * every link that used to live behind the top-bar hamburger is still reachable.
 *
 * Messages itself is still one tap away: it is the first item in the drawer
 * (NAV_ITEMS). Hidden at `lg` and above, where the left rail takes over.
 */

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { user } = useUser()
  const { data: unread } = useCached<{ totalUnread: number }>('/api/unread')
  const unreadCount = unread?.totalUnread ?? 0

  const profileHref = user?.username ? `/${user.username}` : '/profile'
  const subtitle = user?.recruiterProfile?.organization || user?.professionalProfile?.title || ''

  // Close on route change.
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex w-full max-w-none flex-col bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <Link href="/feed" prefetch onClick={onClose} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[15px] font-bold text-white">
              P
            </span>
            <span className="text-[16px] font-bold tracking-tight text-ink">Positioned</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-sunken"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const count = item.badge === 'messages' ? 0 : unreadCount
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                <span className="relative flex-shrink-0">
                  <Icon className="h-[21px] w-[21px]" />
                  {item.badge && count > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-line p-2">
          <ProfileMenu
            name={user?.name}
            subtitle={subtitle}
            profileHref={profileHref}
            photo={user?.professionalProfile?.profilePhoto ?? user?.recruiterProfile?.profilePhoto ?? null}
          />
        </div>
      </div>
    </div>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useUser()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Slide the tab bar away while the user is scrolling through the reel, then
  // bring it back on scroll-up or tap - same trigger the old top bar used.
  const [hidden, setHidden] = useState(false)

  // Reset on route change so a hidden bar from the reel never carries over.
  useEffect(() => {
    setHidden(false)
  }, [pathname])

  useEffect(() => {
    const onReelScroll = (e: Event) => {
      const detail = (e as CustomEvent<ReelScrollDetail>).detail
      setHidden(Boolean(detail?.hidden))
    }
    window.addEventListener(REEL_SCROLL_EVENT, onReelScroll as EventListener)
    return () =>
      window.removeEventListener(REEL_SCROLL_EVENT, onReelScroll as EventListener)
  }, [])

  const avatarSrc =
    user?.professionalProfile?.profilePhoto ??
    user?.recruiterProfile?.profilePhoto ??
    null

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`)

  const tabClass = (href: string) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
      isActive(href) ? 'text-ink' : 'text-ink-subtle'
    }`

  return (
    <>
      <nav
        className={`fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-line bg-white pb-[env(safe-area-inset-bottom)] transition-transform duration-200 lg:hidden ${hidden ? 'translate-y-full' : 'translate-y-0'}`}
        style={{ height: 'var(--bottombar-h)' }}
      >
        <Link href="/feed" prefetch className={tabClass('/feed')}>
          <HomeIcon className="h-[21px] w-[21px]" />
          Home
        </Link>

        <Link href="/explore" prefetch className={tabClass('/explore')}>
          <CompassIcon className="h-[21px] w-[21px]" />
          Explore
        </Link>

        <CreatePostTrigger
          ariaLabel="Create post"
          className="relative flex w-16 flex-col items-center justify-center"
        >
          <span className="-mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-black)] text-[var(--surface)] shadow-[0_6px_16px_rgba(0,0,0,0.28)]">
            <PlusIcon className="h-6 w-6" />
          </span>
        </CreatePostTrigger>

        <Link href="/profile/notifications" prefetch className={tabClass('/profile/notifications')}>
          <BellIcon className="h-[21px] w-[21px]" />
          Notifications
        </Link>

        {/* Profile photo replaces the old Messages tab. Tapping it opens the
            drawer, which holds Messages (and every other NAV_ITEMS link) plus
            View profile / Sign out. */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-ink-subtle transition-colors"
        >
          <span className="flex h-[21px] w-[21px] items-center justify-center overflow-hidden rounded-full bg-brand-light text-[9px] font-bold text-ink">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt={user?.name ?? 'Profile'} className="h-full w-full object-cover" />
            ) : user?.name ? (
              initialsOf(user.name)
            ) : (
              <HomeIcon className="h-[21px] w-[21px]" />
            )}
          </span>
          Profile
        </button>
      </nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
