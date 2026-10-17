import type { NextAuthOptions } from 'next-auth'
import type { Profile } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { authProviders, env } from '@/lib/env'
import { isAuthorizedEmail } from '@/lib/authorization'

interface GithubEmail {
  email: string
  primary: boolean
  verified: boolean
}

function isGithubEmail(value: unknown): value is GithubEmail {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return (
    'email' in value &&
    typeof value.email === 'string' &&
    'primary' in value &&
    typeof value.primary === 'boolean' &&
    'verified' in value &&
    typeof value.verified === 'boolean'
  )
}

function hasVerifiedGoogleEmail(
  profile: Profile | undefined,
): profile is Profile & { email: string; email_verified: true } {
  return (
    profile !== undefined &&
    'email_verified' in profile &&
    profile.email_verified === true &&
    typeof profile.email === 'string'
  )
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(authProviders.github && env.GITHUB_ID && env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
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
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        if (!hasVerifiedGoogleEmail(profile) || !isAuthorizedEmail(profile.email)) {
          return false
        }

        user.email = profile.email
        return true
      }

      if (account?.provider === 'github' && account.access_token) {
        const response = await fetch('https://api.github.com/user/emails', {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${account.access_token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          console.error(`GitHub email verification failed with HTTP ${response.status}`)
          return false
        }

        const responseBody: unknown = await response.json()
        if (!Array.isArray(responseBody)) {
          console.error('GitHub email verification returned an invalid response')
          return false
        }

        const emails = responseBody.filter(isGithubEmail)
        const authorizedEmail =
          emails.find((email) => email.primary && email.verified && isAuthorizedEmail(email.email)) ??
          emails.find((email) => email.verified && isAuthorizedEmail(email.email))

        if (!authorizedEmail) {
          return false
        }

        user.email = authorizedEmail.email
        return true
      }

      return false
    },
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
