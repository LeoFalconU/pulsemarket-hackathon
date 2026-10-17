import { expect, test } from '@playwright/test'
import { prisma } from '@/lib/prisma'
import { signInTestUser } from './helpers/auth'

test('flujo de datos: crea un producto y aparece en el catálogo', async ({ page }) => {
  await signInTestUser(page)
  await page.goto('/dashboard/products')

  const name = `Producto E2E ${Date.now()}`
  await page.getByTestId('product-name').fill(name)
  await page.getByTestId('product-category').selectOption('Hogar')
  await page.getByTestId('product-price').fill('45.5')
  await page.getByTestId('product-stock').fill('9')
  await page.getByTestId('product-create').click()

  await expect(page.getByTestId('product-row').filter({ hasText: name })).toBeVisible()
  await expect(page.getByTestId('query-sla')).toHaveText('OK')

  const persisted = await prisma.product.findFirst({
    where: { name, isDeleted: false },
  })
  expect(persisted).not.toBeNull()
  expect(Number(persisted?.price)).toBe(45.5)
  expect(persisted?.stock).toBe(9)

  if (persisted) {
    await prisma.product.update({
      where: { id: persisted.id },
      data: { isDeleted: true },
    })
  }
})
