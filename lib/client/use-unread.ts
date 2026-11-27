'use client'

import { useCached } from '@/lib/client/use-cached'

type Unread = { totalUnread: number }

/**
 * Shared unread-count hook for the nav badges.
 *
 * Previously TopNav, Sidebar, and MobileNav each called
 * useCached('/api/unread') with no refresh, so the badge only moved on a
 * full reload or an explicit mutate (closing a thread, etc.). This keeps
 * the SAME cache key (so existing mutate('/api/unread') calls still work)
 * but adds a poll so a new inbound message or like shows up on its own.
 *
 * Realtime (lib/client/use-realtime.ts) is now the PRIMARY path and calls
 * mutate('/api/unread') on inbound rows. This poll is a slow SAFETY NET for
 * the cases realtime does not cover: a dropped WebSocket mid-session, a
 * reconnect gap, or a like notification (likes are not subscribed). Because
 * the network is no longer the main path, the interval is long (60s) - the
 * badge still updates instantly in the normal case via realtime.
 */
export function useUnreadCount(refreshInterval = 60000) {
  const { data } = useCached<Unread>('/api/unread', { refreshInterval })
  return data?.totalUnread ?? 0
}
