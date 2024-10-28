import type { NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware';

console.log("Middleware running");

export async function middleware(req: NextRequest) {
  console.log("Middleware updating session");
  return await updateSession(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",]}
