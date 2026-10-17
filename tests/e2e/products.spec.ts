import { expect, test } from '@playwright/test'
import { prisma } from '@/lib/prisma'
import { signInTestUser } from './helpers/auth'

test.describe('Prueba E2E - Flujo de Productos', () => {
  test('crea un producto desde la UI y verifica persistencia en base de datos', async ({ page }) => {
    await signInTestUser(page)
    await page.goto('/dashboard/products')

    const uniqueProductName = `Producto Test E2E - ${Date.now()}`
    await page.getByTestId('product-name').fill(uniqueProductName)
    await page.getByTestId('product-category').selectOption('Electrónica')
    await page.getByTestId('product-price').fill('299.99')
    await page.getByTestId('product-stock').fill('42')
    await page.getByTestId('product-create').click()

    await expect(page.getByTestId('product-row').filter({ hasText: uniqueProductName })).toBeVisible({
      timeout: 10000,
    })

    const dbProduct = await prisma.product.findFirst({
      where: { name: uniqueProductName, isDeleted: false },
    })
    expect(dbProduct).not.toBeNull()
    expect(dbProduct?.category).toBe('Electrónica')
    expect(Number(dbProduct?.price)).toBe(299.99)

    if (dbProduct) {
      await prisma.product.update({
        where: { id: dbProduct.id },
        data: { isDeleted: true },
      })
    }
  })
})
