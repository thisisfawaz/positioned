import { MobileTopBar, MobileBottomNav } from '@/components/navigation/MobileNav'
import { Sidebar } from '@/components/navigation/Sidebar'

/**
 * App shell.
 *
 * Auth is enforced by middleware.ts BEFORE this layout runs (it redirects
 * unauthenticated requests to /auth/login). This layout therefore does NOT do a
 * server-side session lookup: that await was blocking EVERY navigation, so the
 * page could not render until the session read finished - the "click, dead air,
 * then it switches" behaviour. Role and name are supplied on the client by the
 * already-cached useUser() hook (see Sidebar / MobileBottomNav), so the shell
 * paints instantly and the role-dependent bits settle a beat later.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MobileTopBar />

      {/* Two columns: nav rail + content. Pages control their own width. */}
      <div className="flex w-full items-start">
        <Sidebar />

        {/* The mobile top bar is `fixed`, so it is OUT of flow: normal pages
            pad by the shared --topbar-h/--bottombar-h so they clear both bars. */}
        <main className="app-main min-w-0 flex-1">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}
