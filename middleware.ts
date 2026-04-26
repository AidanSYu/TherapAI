import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Simple middleware without Supabase dependency
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add any custom headers or logic here if needed
  // For now, just pass through all requests

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
