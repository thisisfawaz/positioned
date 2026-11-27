'use client'

import { useEffect, useRef, useState } from 'react'
import { useSWRConfig } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { clearCached } from '@/lib/client/use-cached'

/**
 * One Supabase Realtime channel for the signed-in user.
 *
 * Subscribes to the row changes that actually move the UI:
 *   - ContactRequest  (new inbound message / conversation)   filter toUserId
 *   - ContactReply    (a new reply in a thread)              broadcast, we
 *                     refetch the open thread key regardless of which one
 *   - DocumentRequest (CV/portfolio request to a post owner)  filter ownerId
 *   - WorkPost        (a post created/edited/deleted)         whole table, we
 *                     revalidate /api/home + every /api/profile/* key. The
 *                     owner is a PROFILE id, so there is no user id to filter
 *                     on; the API re-applies visibility on revalidation.
 *
 * On ANY event it calls the supplied `onChange` (default: mutate the standard
 * keys). SWR's mutate is cheap and deduped, so firing the same key from several
 * events in a burst is fine.
 *
 * Notes:
 *   - Realtime honors RLS SELECT policies, so a subscriber only receives rows
 *     they are allowed to see. The filters below are an extra narrowing layer,
 *     not the security boundary.
 *   - Supabase's browser client auto-reconnects. When it does, SWR's
 *     revalidateOnFocus (already on) plus the slow poll catch anything missed
 *     while offline.
 *   - `Like` is intentionally NOT subscribed: likes never set the unread badge
 *     (the API marks them unread:false), so the notification page's slow poll
 *     is enough for them.
 */
export function useRealtime(opts?: {
  userId?: string
  onReply?: (contactRequestId: string) => void
}) {
  const { mutate } = useSWRConfig()
  const userId = opts?.userId
  const onReply = opts?.onReply
  const [connected, setConnected] = useState(false)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const refreshUnread = () => mutate('/api/unread')
    const refreshInbox = () => {
      mutate('/api/messages')
      mutate('/api/unread')
      mutate('/api/notifications')
    }
    // A post changed somewhere: refresh the feed and EVERY cached profile.
    // mutate with a filter function matches all `/api/profile/<username>` keys
    // in one pass (SWR 2 key-filter form), so we do not have to track which
    // profiles are mounted.
    const refreshPosts = () => {
      mutate('/api/home')
      mutate((key) => typeof key === 'string' && key.startsWith('/api/profile/'))
    }

    const channel = supabase
      .channel(`user:${userId}`)
      // New / updated inbound conversation.
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ContactRequest',
          filter: `toUserId=eq.${userId}`,
        },
        () => refreshInbox()
      )
      // New reply in any thread the user is part of. We do not filter by a
      // specific conversation id here - the channel covers all of them, and
      // the per-thread key is mutated only when it matches.
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ContactReply' },
        (payload) => {
          const contactRequestId = (payload.new as { contactRequestId?: string })
            ?.contactRequestId
          if (contactRequestId) {
            const key = `/api/messages/${contactRequestId}`
            // Clear the module cache FIRST (notifies useCached listeners),
            // then revalidate SWR. Either alone could leave the open popup
            // showing stale data; together they guarantee a fresh render.
            clearCached(key)
            mutate(key)
            if (onReply) onReply(contactRequestId)
          }
          refreshUnread()
        }
      )
      // A CV / portfolio request addressed to this author.
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'DocumentRequest',
          filter: `ownerId=eq.${userId}`,
        },
        () => mutate('/api/notifications')
      )
      // A post was created / edited / deleted by anyone. Refreshes the feed
      // and all cached profile pages. The author's own instant-insert is
      // still handled optimistically by setPendingPost in the composer; this
      // makes OTHER viewers (and the author's profile tab) update live too.
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'WorkPost' },
        () => refreshPosts()
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [userId, mutate, onReply])

  return { connected }
}
