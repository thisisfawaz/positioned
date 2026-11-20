import {
  HomeIcon,
  CompassIcon,
  UsersIcon,
  BookmarkIcon,
  ChatIcon,
  BellIcon,
  FolderIcon,
  EyeIcon,
  DollarIcon,
  SettingsIcon,
} from '@/components/icons'

export type NavItem = {
  name: string
  href: string
  icon: (p: { className?: string }) => React.ReactNode
  tooltip?: string
  badge?: 'messages' | 'notifications'
}

/**
 * The app's primary navigation, shared by the desktop sidebar and the mobile
 * drawer. ONE list so the two can never drift (removing an item in one place
 * used to leave the other stale).
 */
export const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/feed', icon: HomeIcon },
  { name: 'Explore', href: '/explore', icon: CompassIcon },
  { name: 'My List', href: '/list', icon: UsersIcon },
  { name: 'Messages', href: '/messages', icon: ChatIcon, badge: 'messages' },
  { name: 'Saves', href: '/profile/saved-work', icon: BookmarkIcon },
  { name: 'Notifications', href: '/profile/notifications', icon: BellIcon, badge: 'notifications' },
  { name: 'Responses', href: '/responses', icon: FolderIcon },
  { name: 'Boost Visibility', href: '/profile/visibility', icon: EyeIcon },
  { name: 'Premium', href: '/premium', icon: DollarIcon, tooltip: 'Go Premium' },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]
