import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Temporarily disabled to debug authentication
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/upload/:path*',
    '/login',
    '/register',
  ]
}