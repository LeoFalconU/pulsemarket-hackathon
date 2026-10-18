import { test, expect } from '@playwright/test'
import { signInTestUser } from './helpers/auth'

test.describe('Flujo 1: Seguridad y Autenticación', () => {
  test('La página inicial lleva directamente al inicio de sesión', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*\/login/)
    await expect(page.getByTestId('login-google')).toBeVisible()
    await expect(page.getByTestId('login-github')).toBeVisible()
  })

  test('Redirección del Middleware: Protege el acceso al dashboard', async ({ page }) => {
    // Intentamos ir a una ruta protegida sin estar logueados
    await page.goto('/dashboard')
    // El middleware debe atraparnos y mandarnos al login
    await expect(page).toHaveURL(/.*\/login/)
  })


  test('Intento fallido: Muestra alerta visual al fallar la autenticación', async ({ page }) => {
    // Simulamos que el proveedor (ej. Google) rechazó el acceso regresando un error en la URL
    await page.goto('/login?error=AccessDenied')
    
    // Verificamos que el componente LoginForm lea el error y lo muestre
    const errorAlert = page.getByTestId('login-error')
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toContainText('Acceso denegado')
  })

  test('Las APIs protegidas rechazan solicitudes sin sesión', async ({ request }) => {
    const productsResponse = await request.get('/api/products')
    const kanbanResponse = await request.get('/api/kanban')

    expect(productsResponse.status()).toBe(401)
    expect(kanbanResponse.status()).toBe(401)
  })

  test('Login UI: muestra solo proveedores configurados', async ({ page }) => {
    await page.goto('/login')

    const googleBtn = page.getByTestId('login-google')
    const githubBtn = page.getByTestId('login-github')
    const googleConfigured = Boolean(
      process.env.DATABASE_URL &&
        process.env.NEXTAUTH_SECRET &&
        process.env.NEXTAUTH_URL &&
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET,
    )
    const githubConfigured = Boolean(
      process.env.DATABASE_URL &&
        process.env.NEXTAUTH_SECRET &&
        process.env.NEXTAUTH_URL &&
        process.env.GITHUB_ID &&
        process.env.GITHUB_SECRET,
    )

    if (googleConfigured) {
      await expect(googleBtn).toBeVisible()
    } else {
      await expect(googleBtn).toHaveCount(0)
    }

    if (githubConfigured) {
      await expect(githubBtn).toBeVisible()
    } else {
      await expect(githubBtn).toHaveCount(0)
    }

    if (!googleConfigured && !githubConfigured) {
      await expect(page.getByRole('status')).toContainText('El acceso no está listo')
    }
  })

  test('Una sesión autenticada puede acceder al dashboard', async ({ page }) => {
    await signInTestUser(page)
    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: 'Dashboard PulseMarket' })).toBeVisible()
  })
})