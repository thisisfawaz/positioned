'use client'

import { SWRConfig } from 'swr'
import { fetcher } from '@/lib/client/fetcher'

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        // Only refetch on mount if there is no cached data.
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
        dedupingInterval: 60000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
