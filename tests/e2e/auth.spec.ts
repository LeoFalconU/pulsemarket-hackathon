import { test, expect } from '@playwright/test'

test.describe('Flujo 1: Seguridad y Autenticación', () => {
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

  test('Login exitoso (UI): Renderiza los botones exclusivos de acceso', async ({ page }) => {
    await page.goto('/login')
    
    // Verificamos que existan estrictamente los botones solicitados
    const googleBtn = page.getByTestId('login-google')
    const githubBtn = page.getByTestId('login-github')

    await expect(googleBtn).toBeVisible()
    await expect(githubBtn).toBeVisible()
  })
})