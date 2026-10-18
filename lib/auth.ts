import type { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { authProviders, env } from '@/lib/env'

export const authOptions: NextAuthOptions = {
  providers: [
    ...(authProviders.github && env.GITHUB_ID && env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
            issuer: 'https://github.com',
          }),
        ]
      : []),
    ...(authProviders.google && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token }) {
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.email = session.user.email ?? token.email
      }
      return session
    },
  },
}
