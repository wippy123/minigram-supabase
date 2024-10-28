import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('🔒 Middleware executing for path:', req.nextUrl.pathname)
  try {
    // Create a response first
    const res = NextResponse.next()
    
    // Create the Supabase client
    const supabase = createMiddlewareClient({ req, res })

    // Verify the session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('🔒 Middleware auth error:', error.message)
      // Handle auth error by redirecting to login
      return redirectToLogin(req)
    }

    // If no session and not accessing a public route, redirect to login
    if (!session) {
      return redirectToLogin(req)
    }

    return res
  } catch (error) {
    console.error('🔒 Middleware execution error:', error)
    return redirectToLogin(req)
  }
}

function redirectToLogin(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const redirectUrl = new URL('/login', requestUrl.origin)
  redirectUrl.searchParams.set('redirectedFrom', requestUrl.pathname)
  return NextResponse.redirect(redirectUrl)
}

// Update matcher to include all protected routes and exclude public ones
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - auth related routes (login, register)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|register|public).*)',
  ],
}
