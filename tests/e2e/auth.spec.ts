import { expect, test } from '@playwright/test'
import { signInTestUser } from './helpers/auth'

test('flujo de seguridad: bloqueo, error de login y acceso autenticado', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)

  await page.goto('/login?error=AccessDenied')
  await expect(page.getByTestId('login-error')).toContainText('Acceso denegado')
  await expect(page.getByTestId('login-google')).toBeVisible()
  await expect(page.getByTestId('login-github')).toBeVisible()

  await signInTestUser(page)
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard PulseMarket' })).toBeVisible()
})
