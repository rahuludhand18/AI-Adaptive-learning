import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Which role each protected section requires.
const SECTION_ROLE: Record<string, 'ADULT' | 'PARENT' | 'KID'> = {
  '/adult': 'ADULT',
  '/parent': 'PARENT',
  '/kid': 'KID',
};

// Where to send a logged-in user who lands in the wrong section.
const DASHBOARD: Record<string, string> = {
  ADULT: '/adult/dashboard',
  PARENT: '/parent/dashboard',
  KID: '/kid/dashboard',
};

// Route guard: keeps each role inside its own space. This is a UX/navigation guard
// (cookies are readable client-side); real data protection stays with the backend JWT.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const section = Object.keys(SECTION_ROLE).find(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  if (!section) return NextResponse.next(); // not a guarded section

  const token = req.cookies.get('accessToken')?.value;
  const userCookie = req.cookies.get('user')?.value;

  // not signed in -> login
  if (!token || !userCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // read the role from the user cookie
  let role: string | null = null;
  try {
    role = JSON.parse(decodeURIComponent(userCookie))?.role ?? null;
  } catch {
    role = null;
  }
  
  const activeRole = req.cookies.get('activeRole')?.value;

  // special case: PARENT can be 'child' (for /kid) or 'parent' (for /parent)
  if (role === 'PARENT') {
    if (section === '/parent') {
      if (activeRole !== 'parent') {
        const url = req.nextUrl.clone();
        url.pathname = '/select-profile';
        return NextResponse.redirect(url);
      }
    } else if (section === '/kid') {
      if (activeRole !== 'child') {
        const url = req.nextUrl.clone();
        url.pathname = '/select-profile';
        return NextResponse.redirect(url);
      }
    } else {
      // PARENT trying to access /adult -> redirect to /select-profile
      const url = req.nextUrl.clone();
      url.pathname = '/select-profile';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // wrong role -> send to their own dashboard (or login if unknown)
  if (role !== SECTION_ROLE[section]) {
    const url = req.nextUrl.clone();
    url.pathname = role && DASHBOARD[role] ? DASHBOARD[role] : '/auth/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only run on the three role sections; the landing page, /auth/*, assets, and
// _next internals are never touched.
export const config = {
  matcher: ['/adult/:path*', '/parent/:path*', '/kid/:path*'],
};
