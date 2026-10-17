import { afterEach, describe, expect, it, vi } from 'vitest'
import { authOptions } from '@/lib/auth'

const signIn = authOptions.callbacks?.signIn

if (!signIn) {
  throw new Error('NextAuth signIn callback is not configured')
}

const baseUser = {
  id: 'test-user',
  name: 'Test User',
  email: 'user@utez.edu.mx',
  image: null,
}

describe('OAuth domain authorization', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('accepts Google only when the provider confirms the allowed email', async () => {
    const profile = { email: 'user@utez.edu.mx', email_verified: true }

    await expect(
      signIn({
        user: { ...baseUser },
        account: {
          provider: 'google',
          type: 'oauth',
          providerAccountId: 'google-user',
        },
        profile,
      }),
    ).resolves.toBe(true)
  })

  it('rejects unverified or out-of-domain Google emails', async () => {
    const unverifiedProfile = { email: 'user@utez.edu.mx', email_verified: false }
    const outsideDomainProfile = {
      email: 'user@example.com',
      email_verified: true,
    }

    await expect(
      signIn({
        user: { ...baseUser },
        account: {
          provider: 'google',
          type: 'oauth',
          providerAccountId: 'google-user',
        },
        profile: unverifiedProfile,
      }),
    ).resolves.toBe(false)

    await expect(
      signIn({
        user: { ...baseUser },
        account: {
          provider: 'google',
          type: 'oauth',
          providerAccountId: 'google-user',
        },
        profile: outsideDomainProfile,
      }),
    ).resolves.toBe(false)
  })

  it('accepts GitHub only when an email from the allowed domain is verified', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            email: 'user@utez.edu.mx',
            primary: true,
            verified: true,
            visibility: 'private',
          },
        ]),
        { status: 200 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      signIn({
        user: { ...baseUser, email: null },
        account: {
          provider: 'github',
          type: 'oauth',
          providerAccountId: 'github-user',
          access_token: 'test-access-token',
        },
      }),
    ).resolves.toBe(true)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/user/emails',
      expect.objectContaining({ cache: 'no-store' }),
    )
  })

  it('rejects GitHub accounts without a verified authorized email', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              email: 'user@utez.edu.mx',
              primary: true,
              verified: false,
              visibility: 'private',
            },
          ]),
          { status: 200 },
        ),
      ),
    )

    await expect(
      signIn({
        user: { ...baseUser },
        account: {
          provider: 'github',
          type: 'oauth',
          providerAccountId: 'github-user',
          access_token: 'test-access-token',
        },
      }),
    ).resolves.toBe(false)
  })
})
