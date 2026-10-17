import { withAuth } from 'next-auth/middleware'
import { isAuthorizedEmail } from '@/lib/authorization'

export default withAuth({
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized: ({ token }) => isAuthorizedEmail(token?.email),
  },
})

export const config = {
  matcher: ['/dashboard/:path*'],
}
