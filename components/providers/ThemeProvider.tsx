'use client'

import { useEffect } from 'react'
import useSWR from 'swr'

type ThemeMode = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'positioned-theme'

function resolve(mode: ThemeMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function apply(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', resolve(mode))
}

/**
 * Applies the saved theme.
 *
 * The initial value comes from localStorage, not the network, so the correct
 * theme is applied before the first paint - no flash of light. The database
 * remains the durable copy; the value is written to localStorage after a
 * successful save so the next load is instant and offline-safe.
 */
export function ThemeProvider() {
  const { data } = useSWR<{ settings: { themeMode?: ThemeMode } }>('/api/settings')

  // 1. On mount, apply whatever was last used. This runs before the DB response.
  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    apply(stored ?? 'light')
  }, [])

  // 2. When the DB value arrives, adopt it and cache it locally.
  useEffect(() => {
    const mode = data?.settings?.themeMode
    if (!mode) return
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
    apply(mode)
  }, [data?.settings?.themeMode])

  // 3. Follow the OS while "system" is selected.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (window.localStorage.getItem(THEME_STORAGE_KEY) === 'system') {
        apply('system')
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return null
}
