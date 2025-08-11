import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/register" ||
    path === "/" ||
    path === "/about" ||
    path === "/contact" ||
    path.startsWith("/_next") ||
    path.startsWith("/api")

  // Get the token from the cookies
  const token = request.cookies.get("auth-token")?.value || ""

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the user is logged in and trying to access login page, redirect to dashboard
  if (path === "/login" && token) {
    // Check if user is admin
    const isAdmin = request.cookies.get("user-role")?.value === "admin"

    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/user/dashboard", request.url))
    }
  }

  // If the user is trying to access admin routes but is not an admin
  if (path.startsWith("/admin") && request.cookies.get("user-role")?.value !== "admin") {
    return NextResponse.redirect(new URL("/user/dashboard", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
