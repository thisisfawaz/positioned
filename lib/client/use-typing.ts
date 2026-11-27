'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * "<name> is typing..." for one conversation, via Supabase Realtime Broadcast.
 *
 * Typing is EPHEMERAL: it is not a row, so postgres_changes cannot carry it.
 * Broadcast is a pub/sub channel scoped to `typing:<contactRequestId>`; events
 * are fire-and-forget and never hit the database.
 *
 * Behavior:
 *   - notifyTyping() is throttled to at most once per THROTTLE_MS while the
 *     user keeps typing, so we do not flood the channel per keystroke.
 *   - Each received ping (re)arms a CLEAR_AFTER_MS timer; when it lapses with
 *     no further ping, the indicator disappears. This is what makes it vanish
 *     when the other person stops or closes the tab - there is no reliable
 *     "stopped typing" event.
 *   - A 'stop' event (sent on submit) clears immediately.
 *   - Our own broadcasts are ignored by userId.
 *
 * Broadcast does not touch Postgres, so no publication or RLS change is
 * needed. Realtime Authorization can lock the channel down later if desired.
 */
const THROTTLE_MS = 2500
const CLEAR_AFTER_MS = 4000

export function useTyping(
  contactRequestId: string,
  opts: { userId?: string; name?: string }
) {
  const { userId, name } = opts
  const [typingName, setTypingName] = useState<string | null>(null)
  const lastSentRef = useRef(0)
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // `send` is only armed once the channel reaches SUBSCRIBED. Supabase drops
  // broadcasts sent before then, and a PRIVATE channel has an auth handshake
  // first - so assigning this right after .subscribe() (as before) silently
  // dropped the first typing pings, which is why the indicator never showed.
  const sendRef = useRef<((event: string, payload: Record<string, unknown>) => void) | null>(null)

  useEffect(() => {
    if (!contactRequestId) return
    const supabase = createClient()
    // private: true opts this channel into Realtime Authorization - the SQL
    // policy in 038_realtime_typing_auth.sql decides who may subscribe.
    // Without it the channel is public and anyone who knows the id could
    // listen for the typing pings.
    const channel = supabase.channel(`typing:${contactRequestId}`, {
      config: { private: true, broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'typing' }, (msg) => {
        const from = msg.payload as { userId?: string; name?: string }
        if (!from?.userId || from.userId === userId) return
        setTypingName(from.name ?? 'Someone')
        if (clearTimer.current) clearTimeout(clearTimer.current)
        clearTimer.current = setTimeout(() => setTypingName(null), CLEAR_AFTER_MS)
      })
      .on('broadcast', { event: 'stop' }, (msg) => {
        const from = msg.payload as { userId?: string }
        if (from?.userId === userId) return
        setTypingName(null)
      })
      .subscribe((status, err) => {
        // Arm the sender only once actually subscribed; otherwise drop it.
        if (status === 'SUBSCRIBED') {
          sendRef.current = (event, payload) => {
            channel.send({ type: 'broadcast', event, payload })
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          sendRef.current = null
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[typing] channel', status, err?.message ?? '')
          }
        }
      })

    return () => {
      sendRef.current = null
      if (clearTimer.current) clearTimeout(clearTimer.current)
      supabase.removeChannel(channel)
    }
  }, [contactRequestId, userId])

  const notifyTyping = useCallback(() => {
    if (!userId) return
    const now = Date.now()
    if (now - lastSentRef.current < THROTTLE_MS) return
    lastSentRef.current = now
    sendRef.current?.('typing', { userId, name })
  }, [userId, name])

  const notifyStop = useCallback(() => {
    if (!userId) return
    lastSentRef.current = 0
    sendRef.current?.('stop', { userId })
  }, [userId])

  return { typingName, notifyTyping, notifyStop }
}
