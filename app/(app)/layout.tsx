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
    <div className="min-h-screen bg-white dark:bg-[#121218]">
      <MobileTopBar />

      {/* Two columns: nav rail + content. The right rail was removed. Pages
          control their own width - the feed caps itself, Explore fills. */}
      <div className="flex w-full items-start">
        <Sidebar role={effectiveRole} />

        {/* NO top padding. The bar is `fixed`, so it overlays the page; the
            scrolled content runs underneath it and fills the area, which is what
            was asked for. Adding `pt-*` here would reserve a permanent empty
            strip at the top - the exact gap this replaces. */}
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      <MobileBottomNav role={effectiveRole} userName={name ?? ''} />
    </div>
  )
}
