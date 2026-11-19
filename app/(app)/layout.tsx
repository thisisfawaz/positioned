import { redirect } from 'next/navigation'
import { MobileTopBar, MobileBottomNav } from '@/components/navigation/MobileNav'
import { Sidebar } from '@/components/navigation/Sidebar'
import { getSessionRole } from '@/lib/auth/get-session-role'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware already rejects unauthenticated requests. This is a cheap
  // backstop, and reading the role from session metadata means the shell does
  // NOT wait on a Prisma query the way it used to.
  const { userId, role, name } = await getSessionRole()

  if (!userId) {
    redirect('/auth/login')
  }

  const effectiveRole = role ?? 'PROFESSIONAL'

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MobileTopBar />

      {/* Two columns: nav rail + content. The right rail was removed. Pages
          control their own width - the feed caps itself, Explore fills. */}
      <div className="flex w-full items-start">
        <Sidebar role={effectiveRole} />

        {/* The mobile top bar is `fixed`, so it is OUT of flow: normal pages
            pad by the shared --topbar-h/--bottombar-h so they clear both bars.
            The reel cancels exactly those same variables (see ReelFeed) so it
            fills the space BETWEEN the bars, and then grows to full screen
            when the bars slide away on scroll. */}
        <main className="app-main min-w-0 flex-1">
          {children}
        </main>
      </div>

      <MobileBottomNav role={effectiveRole} userName={name ?? ''} />
    </div>
  )
}
