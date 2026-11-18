import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that do NOT require a session.
const PUBLIC_PREFIXES = ['/auth', '/api/auth']
const PUBLIC_EXACT = ['/']

function isPublic(pathname: string) {
  if (PUBLIC_EXACT.includes(pathname)) return true
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

/**
 * Auth boundary for the app.
 *
 * The (app) layout used to be the only place auth was enforced, which meant the
 * shell could not render until a Prisma query finished. Middleware now rejects
 * unauthenticated requests BEFORE any layout runs, so the layout is free to
 * stream. Session refresh still happens here via getUser().
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession() decodes the JWT from the cookie LOCALLY. getUser() makes a
  // network round-trip to Supabase Auth on EVERY request - including static
  // assets - which was adding ~1.1s to every page load in dev.
  //
  // Tradeoff, same as lib/auth/get-current-user.ts: the cookie is trusted until
  // the JWT expires, so a revoked session stays valid briefly. Acceptable here
  // because this middleware is a UX gate; the real data boundary is RLS.
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user

  const { pathname } = request.nextUrl

  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
