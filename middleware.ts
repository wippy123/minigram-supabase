import type { NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware';


export async function middleware(req: NextRequest) {
  return await updateSession(req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login
     * - /sign-up
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, and other static assets
     */
    "/((?!login|sign-up|forgot-password|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
}
