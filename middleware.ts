import { User } from 'lucide-react'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of protected routes
const protectedPaths = ['/dashboard', '/write', '/edit-book']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is protected
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    // Here, check auth cookie or header (depends on your auth method)
    // For supabase, check cookie "sb-access-token" (or your own)
    const token = request.cookies.get('sb-access-token')

    if (!User) {
      // Redirect to home page with authModal open query param
      const url = new URL('/', request.url)
      url.searchParams.set('authModal', 'open')
      return NextResponse.redirect(url)
    }
  }

  // Allow request to continue
  return NextResponse.next()
}
