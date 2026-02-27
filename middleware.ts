import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Attempt to read Supabase session from cookies and attach a lightweight
// `x-user-id` header when available. Note: this requires cookie-based
// auth storage (Supabase auth tokens in cookies). If your app currently
// uses localStorage for auth, server-side session detection won't work
// until you switch to cookie storage or use the auth helper routes.

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  try {
    const supabase = createMiddlewareClient({ req, res })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session && session.user && session.user.id) {
      // expose the user id to downstream server code / edge handlers
      res.headers.set('x-user-id', session.user.id)
    }
  } catch (e) {
    // on any error, don't block the request — fall back to client-side guards
    // or other server-side checks.
  }

  return res;
}

export const config = {
  // include both localized and English add-ticket routes for compatibility
  matcher: ['/profile', '/bilet-ekle', '/tickets/new'],
};
