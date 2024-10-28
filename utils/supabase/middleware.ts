import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    const supabase = createMiddlewareClient({ req: request, res: response })

    const user = await supabase.auth.getUser()

    // This will refresh session if expired - required for Server Components
    await supabase.auth.getSession()
    // https://supabase.com/docs/guides/auth/server-side/nextjs

    console.log("Middleware user", {user, path:request.nextUrl.pathname, error: user.error});
    // protected routes
    if (!user.data.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
