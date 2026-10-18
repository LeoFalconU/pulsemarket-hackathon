import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  // Se protegen explícitamente tanto la ruta principal como cualquier subruta
  matcher: ['/dashboard', '/dashboard/:path*'],
}