'use client'

import { useUser } from '@/lib/client/use-user'
import { useRealtime } from '@/lib/client/use-realtime'

/**
 * Mounts the single realtime subscription for the session.
 *
 * Lives in the app shell so it survives navigation between pages - creating a
 * channel per page would tear down and rebuild the WebSocket on every click.
 *
 * Renders nothing. If there is no user yet (first paint before useUser
 * resolves), it simply does not subscribe; the hook re-runs once the id
 * arrives.
 */
export function RealtimeBridge() {
  const { user } = useUser()
  useRealtime({ userId: user?.id })
  return null
}
