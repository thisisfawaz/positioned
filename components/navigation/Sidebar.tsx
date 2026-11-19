'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/client/use-user'
import { useCached } from '@/lib/client/use-cached'
import { PlusIcon, SearchIcon } from '@/components/icons'
import { CreatePostTrigger } from '@/components/work/CreatePostTrigger'
import { ProfileMenu } from '@/components/navigation/ProfileMenu'
import { NAV_ITEMS } from '@/components/navigation/navItems'

/**
 * Left navigation rail.
 *
 * Matches the reference design: brand wordmark at the top, a vertical list of
 * icon+label links, a solid purple "Create Post" button, and the signed-in
 * user pinned to the bottom. Icons only (no labels) below `xl`.
 */

export function Sidebar({ role }: { role: string }) {
  const { user } = useUser()
  const pathname = usePathname()
  const isRecruiter = role === 'RECRUITER'

  const { data: unread } = useCached<{ totalUnread: number }>('/api/unread')
  const unreadCount = unread?.totalUnread ?? 0

  const profileHref = user?.username ? `/${user.username}` : '/profile'
  const subtitle = isRecruiter
    ? user?.recruiterProfile?.organization || 'Recruiter'
    : user?.professionalProfile?.title || 'Professional'

  const items = NAV_ITEMS

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <aside className="sticky top-0 z-40 hidden h-screen w-[68px] flex-shrink-0 flex-col bg-white px-3 py-6 lg:flex">
      {/* Brand */}
      <Link href="/feed" className="mb-8 flex items-center gap-2.5 px-1">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand text-[17px] font-bold text-white shadow-[0_4px_12px_rgba(91,61,245,0.24)]">
          P
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const count = item.badge === 'messages' ? 0 : unreadCount
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.name}
              className={`group relative flex items-center justify-center rounded-xl px-3 py-2.5 transition-colors ${
                active
                  ? 'bg-brand-light text-ink'
                  : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
              }`}
            >
              <span className="relative flex-shrink-0">
                <Icon className="h-[21px] w-[21px]" />
                {item.badge && count > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </span>
              {/* Label appears only on hover, as a tooltip to the right. */}
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg border border-line bg-brand-light px-2.5 py-1.5 text-[12px] font-medium text-ink opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Create Post - opens the composer modal in place, no navigation. */}
      <CreatePostTrigger
        title="Create Post"
        className="group relative mt-6 flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-black)] px-3 py-2.5 text-[15px] font-semibold text-[var(--surface)] shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-colors hover:bg-[var(--brand-black-hover)]"
      >
        <PlusIcon className="h-[18px] w-[18px]" />
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg bg-[#1f1f27] px-2.5 py-1.5 text-[12px] font-medium text-[#ffffff] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
        >
          Create Post
        </span>
      </CreatePostTrigger>

      {/* Search shortcut - reference puts search in the middle column, but the
          rail keeps one for narrow widths where that column is hidden. */}
      <Link
        href="/explore"
        title="Search"
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink xl:hidden"
      >
        <SearchIcon className="h-[21px] w-[21px]" />
      </Link>

      {/* Profile pinned to bottom - avatar opens a menu with Sign out. */}
      <ProfileMenu name={user?.name} subtitle={subtitle} profileHref={profileHref} />
    </aside>
  )
}
