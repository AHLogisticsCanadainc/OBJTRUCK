import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  try {
    // Get the pathname
    const pathname = request.nextUrl.pathname

    // Add some debugging to help identify the issue
    console.log("🔍 Middleware processing path:", pathname)

    // Special handling for quotes page and direct quotes route
    if (pathname === "/dashboard/quotes" || pathname === "/quotes-direct") {
      console.log("✅ Processing quotes page request in middleware - ALWAYS ALLOWING")
      // Always allow quotes page through
      return NextResponse.next()
    }

    // Check if this is an auth route
    if (pathname.startsWith("/auth/")) {
      console.log("🔑 Processing auth route in middleware")
      return NextResponse.next()
    }

    // Check if this is an admin route
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      console.log("👑 Processing admin route in middleware")
      // For client-side authentication, we'll let the client handle the redirect
      return NextResponse.next()
    }

    // Check if this is a dashboard route - let client handle auth
    if (pathname.startsWith("/dashboard/")) {
      console.log("📊 Processing dashboard route in middleware - letting client handle auth")
      return NextResponse.next()
    }

    // Check if this is a public route
    if (
      pathname === "/" ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/api/") ||
      pathname.includes("favicon.ico")
    ) {
      console.log("🌐 Processing public route in middleware")
      return NextResponse.next()
    }

    // For all other routes, we'll let the client handle authentication
    console.log("👤 Letting client handle authentication for:", pathname)
    return NextResponse.next()
  } catch (error) {
    // Log the error
    console.error("❌ Middleware error:", error)

    // Redirect to 500 page for server errors
    return NextResponse.rewrite(new URL("/500", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
