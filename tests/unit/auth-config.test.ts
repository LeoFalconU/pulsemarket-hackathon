import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/env', () => ({
  authProviders: { github: true, google: true },
  env: {
    GITHUB_ID: 'github-client-id',
    GITHUB_SECRET: 'github-client-secret',
    GOOGLE_CLIENT_ID: 'google-client-id',
    GOOGLE_CLIENT_SECRET: 'google-client-secret',
    NEXTAUTH_SECRET: 'test-nextauth-secret-at-least-32-characters',
  },
}))

import { authOptions } from '@/lib/auth'

describe('OAuth provider configuration', () => {
  it('configures GitHub issuer validation for GitHub OAuth callbacks', () => {
    expect(authOptions.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'github',
          options: expect.objectContaining({ issuer: 'https://github.com' }),
        }),
      ]),
    )
  })
})
