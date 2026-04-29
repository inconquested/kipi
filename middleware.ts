import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get("better-auth.session_token");

    // Basic protection: if no cookie and trying to access protected routes
    if (!sessionCookie) {
        if (pathname.startsWith("/admin") || pathname.startsWith("/member")) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // If cookie exists and trying to access auth pages
    if (sessionCookie && (pathname === "/login" || pathname === "/register")) {
        // We can't easily check role here without DB, so we'll let the page handle it or redirect to a common dashboard
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/member/:path*", "/login", "/register"],
};

