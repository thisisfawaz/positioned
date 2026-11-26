'use client'

import { SWRConfig } from 'swr'
import { fetcher } from '@/lib/client/fetcher'

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        // Pages must feel LIVE: show cached data immediately (keepPreviousData)
        // but ALWAYS revalidate against the server so a switch shows current
        // data, not whatever was cached earlier in the session. A short dedupe
        // still collapses bursts of identical requests on one render.
        revalidateIfStale: true,
        revalidateOnMount: true,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        keepPreviousData: true,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
