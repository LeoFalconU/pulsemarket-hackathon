import { encode } from 'next-auth/jwt'
import type { Page } from '@playwright/test'

export async function signInTestUser(
  page: Page,
  email = 'e2e-user@utez.edu.mx',
) {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET es requerido para E2E autenticado')
  }

  const token = await encode({
    token: {
      sub: 'e2e-user',
      name: 'Juez E2E',
      email,
    },
    secret,
  })

  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: token,
      url: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])
}
