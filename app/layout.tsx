import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import { SWRProvider } from '@/components/providers/SWRProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
})

export const metadata: Metadata = {
  title: 'Positioned.pro - Show your work. Get discovered.',
  description: 'Position yourself for professional opportunities by showcasing what you can actually do.',
}

// Runs BEFORE the browser paints. The theme provider applies the class in a
// useEffect, which is too late - the first frame is always light, so dark mode
// users see a white flash on every navigation. This blocking script sets the
// class synchronously during head parsing. Keep in sync with
// THEME_STORAGE_KEY in components/providers/ThemeProvider.tsx.
const themeScript = `
(function(){
  try {
    var m = localStorage.getItem('positioned-theme');
    var dark = m === 'dark' || (m === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SWRProvider>
          <ThemeProvider />
          {children}
        </SWRProvider>
      </body>
    </html>
  )
}
