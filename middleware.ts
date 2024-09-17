import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If the user is not logged in and trying to access a protected route, redirect to login
  if (!user && (req.nextUrl.pathname.startsWith('/tasks') || req.nextUrl.pathname.startsWith('/notifications'))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/tasks/:path*', '/notifications/:path*'],
}
