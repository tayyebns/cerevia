import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/auth/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)

  // Redirect unauthenticated users
  if (!user) {
    if (request.nextUrl.pathname.startsWith('/patient') || request.nextUrl.pathname.startsWith('/gp')) {
      return Response.redirect(new URL('/auth/login', request.url))
    }
    return response
  }

  // Role-based routing
  const userRole = user.user_metadata?.role || 'patient'

  if (request.nextUrl.pathname.startsWith('/patient') && userRole === 'gp') {
    return Response.redirect(new URL('/gp', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/gp') && userRole !== 'gp') {
    return Response.redirect(new URL('/patient', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
