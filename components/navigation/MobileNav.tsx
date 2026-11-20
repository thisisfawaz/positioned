'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/client/use-user'
import { useCached } from '@/lib/client/use-cached'
import { initialsOf } from '@/lib/client/social'
import {
  HomeIcon,
  CompassIcon,
  PlusIcon,
  ChatIcon,
  BellIcon,
  SearchIcon,
  MenuIcon,
  CloseIcon,
} from '@/components/icons'
import { CreatePostTrigger } from '@/components/work/CreatePostTrigger'
import { ProfileMenu } from '@/components/navigation/ProfileMenu'
import { NAV_ITEMS } from '@/components/navigation/navItems'
import { REEL_SCROLL_EVENT, type ReelScrollDetail } from '@/lib/client/reel-scroll'

/**
 * Mobile chrome, from the reference's phone screens: a brand bar with actions
 * at the top and a bottom tab bar with a raised centre button. Hidden at `lg`
 * and above, where the left rail takes over.
 *
 * The hamburger opens a DRAWER containing the same nav as the desktop sidebar
 * (NAV_ITEMS), so mobile and desktop stay in sync.
 */

export function MobileTopBar() {
  // Hide-on-scroll. RULE: the top bar only auto-hides on the FEED (the reel),
  // where content runs edge-to-edge behind it. On every other page it stays put
  // so the page keeps its header - scrolling a normal page must NOT slide it
  // away. The feed scrolls inside its own container, so it reports direction
  // via a custom event rather than moving window.scrollY.
  const [hidden, setHidden] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  // Leaving a page must never carry its hidden state over: navs remount on
  // route change and previously inherited the reel's "hidden" event, so the
  // bar stayed gone everywhere after visiting the feed or a profile reel.
  useEffect(() => {
    setHidden(false)
  }, [pathname])

  useEffect(() => {
    const onReelScroll = (e: Event) => {
      const detail = (e as CustomEvent<ReelScrollDetail>).detail
      setHidden(Boolean(detail?.hidden))
    }

    window.addEventListener(REEL_SCROLL_EVENT, onReelScroll as EventListener)
    return () => {
      window.removeEventListener(REEL_SCROLL_EVENT, onReelScroll as EventListener)
    }
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 transition-transform duration-200 lg:hidden ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{ height: 'var(--topbar-h)' }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted"
          >
            <MenuIcon className="h-[21px] w-[21px]" />
          </button>
          <Link href="/feed" prefetch className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[15px] font-bold text-white">
              P
            </span>
            <span className="text-[16px] font-bold tracking-tight text-ink">Positioned</span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/explore"
            prefetch
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted"
          >
            <SearchIcon className="h-[19px] w-[19px]" />
          </Link>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

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
      <div className="absolute inset-y-0 left-0 flex w-[280px] max-w-[82vw] flex-col bg-surface shadow-xl">
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
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            const count = item.badge === 'messages' ? 0 : unreadCount
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
                  active
                    ? 'bg-brand-light text-ink'
                    : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
                }`}
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
          <ProfileMenu name={user?.name} subtitle={subtitle} profileHref={profileHref} />
        </div>
      </div>
    </div>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()
  // Slide the tab bar away while the user is scrolling through the reel, then
  // bring it back on scroll-up or tap - same trigger as the top bar.
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

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`)

  const tabClass = (href: string) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
      isActive(href) ? 'text-ink' : 'text-ink-subtle'
    }`

  return (
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

      <Link href="/messages" prefetch className={tabClass('/messages')}>
        <ChatIcon className="h-[21px] w-[21px]" />
        Messages
      </Link>

      <Link href="/profile/notifications" prefetch className={tabClass('/profile/notifications')}>
        <BellIcon className="h-[21px] w-[21px]" />
        Notifications
      </Link>
    </nav>
  )
}
