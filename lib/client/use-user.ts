'use client'

import { useCached } from '@/lib/client/use-cached'

export type CurrentUser = {
  id: string
  name: string
  username?: string | null
  role: 'PROFESSIONAL' | 'RECRUITER' | 'ADMIN'
  professionalProfile: any | null
  recruiterProfile: any | null
} | null

export function useUser() {
  const { data, isLoading } = useCached<{ user: CurrentUser }>('/api/me')
  return { user: data?.user ?? null, isLoading }
}
