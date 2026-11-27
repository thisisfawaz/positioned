'use client'

import useSWR, { type SWRConfiguration } from 'swr'

const memoryCache: Record<string, unknown> = {}
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function seedCache(key: string, data: unknown) {
  memoryCache[key] = data
  emit()
}

export function getCached<T>(key: string): T | undefined {
  return memoryCache[key] as T | undefined
}

/**
 * Drops a key from the module cache and notifies listeners.
 *
 * Needed after a WRITE: the cache prefers its stored copy over fresh SWR data,
 * so a server `revalidateTag` alone leaves the client showing stale data. Clear
 * the key and the next render refetches.
 */
export function clearCached(key: string) {
  delete memoryCache[key]
  emit()
}

export function useCached<T>(key: string, options?: SWRConfiguration) {
  // 1. Fetch with SWR (only actually hits the network if nothing is cached).
  //    Options pass through unchanged - e.g. { refreshInterval: 15000 } to poll.
  const swr = useSWR<T>(key, options)

  // 2. Write any fresh data back to the module cache.
  if (swr.data !== undefined && memoryCache[key] !== swr.data) {
    memoryCache[key] = swr.data
  }

  // 3. Prefer the module cache — it is available synchronously on the
  //    very first render, so there is never a frame with no data.
  const data = (memoryCache[key] as T | undefined) ?? swr.data

  return {
    ...swr,
    data,
    isLoading: swr.isLoading && data === undefined,
  }
}
