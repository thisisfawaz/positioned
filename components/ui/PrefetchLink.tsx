'use client'

import Link from 'next/link'
import { useSWRConfig } from 'swr'
import { fetcher } from '@/lib/client/fetcher'

export function PrefetchLink({
  href,
  prefetchKey,
  className,
  children,
}: {
  href: string
  prefetchKey?: string
  className?: string
  children: React.ReactNode
}) {
  const { mutate } = useSWRConfig()

  const onHover = () => {
    if (prefetchKey) {
      mutate(prefetchKey, fetcher(prefetchKey), { revalidate: false })
    }
  }

  return (
    <Link href={href} prefetch className={className} onMouseEnter={onHover}>
      {children}
    </Link>
  )
}
