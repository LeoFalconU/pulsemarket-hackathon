# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> flujo de seguridad: bloqueo, error de login y acceso autenticado
- Location: tests\e2e\auth.spec.ts:4:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Dashboard PulseMarket' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Dashboard PulseMarket' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Dashboard PulseMarket' })

```

```yaml
- main:
  - heading "PulseMarket" [level=1]
  - paragraph: Acceso exclusivo con Google o GitHub.
  - button "Continuar con Google"
  - button "Continuar con GitHub"
- alert
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | import { signInTestUser } from './helpers/auth'
  3  | 
  4  | test('flujo de seguridad: bloqueo, error de login y acceso autenticado', async ({ page }) => {
  5  |   await page.goto('/dashboard')
  6  |   await expect(page).toHaveURL(/\/login/)
  7  | 
  8  |   await page.goto('/login?error=AccessDenied')
  9  |   await expect(page.getByTestId('login-error')).toContainText('Acceso denegado')
  10 |   await expect(page.getByTestId('login-google')).toBeVisible()
  11 |   await expect(page.getByTestId('login-github')).toBeVisible()
  12 | 
  13 |   await signInTestUser(page)
  14 |   await page.goto('/dashboard')
> 15 |   await expect(page.getByRole('heading', { name: 'Dashboard PulseMarket' })).toBeVisible()
     |                                                                              ^ Error: expect(locator).toBeVisible() failed
  16 | })
  17 | 
```