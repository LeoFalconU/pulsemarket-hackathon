import { expect, test } from '@playwright/test'
import { signInTestUser } from './helpers/auth'

test('flujo de datos: crea un producto y aparece en el catálogo', async ({ page }) => {
  await signInTestUser(page)
  await page.goto('/dashboard')

  const name = `Producto E2E ${Date.now()}`
  await page.getByTestId('product-name').fill(name)
  await page.getByTestId('product-category').selectOption('Hogar')
  await page.getByTestId('product-price').fill('45.5')
  await page.getByTestId('product-stock').fill('9')
  await page.getByTestId('product-create').click()

  await expect(page.getByTestId('product-row').filter({ hasText: name })).toBeVisible()
  await expect(page.getByTestId('query-sla')).toHaveText('OK')
})
