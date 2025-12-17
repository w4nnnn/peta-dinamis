import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'admin_session';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes (except /admin/login)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

        if (!sessionCookie) {
            // Redirect to login if no session
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        try {
            // Verify session
            const session = JSON.parse(
                Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
            );

            // Check if session expired
            if (session.exp < Date.now()) {
                const loginUrl = new URL('/admin/login', request.url);
                const response = NextResponse.redirect(loginUrl);
                response.cookies.delete(SESSION_COOKIE_NAME);
                return response;
            }
        } catch {
            // Invalid session, redirect to login
            const loginUrl = new URL('/admin/login', request.url);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete(SESSION_COOKIE_NAME);
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
