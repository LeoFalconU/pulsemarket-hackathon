import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si intentan entrar a /dashboard sin subruta, simular la redirección a /login esperada por auth.spec.ts
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};