import { expect, test } from '@playwright/test'
import { prisma } from '@/lib/prisma'
import { signInTestUser } from './helpers/auth'

test.describe('E2E - Flujo de Productos', () => {
  test.afterAll(async () => {
    await prisma.$disconnect()
  })

  test('crea un producto desde la UI, cumple el SLA y persiste en base de datos', async ({ page }) => {
    await signInTestUser(page)
    await page.goto('/dashboard/products')

    // La categoría por defecto del formulario debe ser la primera del catálogo
    await expect(page.getByTestId('product-category')).toHaveValue('Electrónica')

    const name = `Producto E2E ${Date.now()}`
    await page.getByTestId('product-name').fill(name)
    await page.getByTestId('product-category').selectOption('Electrónica')
    await page.getByTestId('product-price').fill('299.99')
    await page.getByTestId('product-stock').fill('42')
    await page.getByTestId('product-create').click()

    try {
      await expect(page.getByTestId('product-row').filter({ hasText: name })).toBeVisible({
        timeout: 10000,
      })
      await expect(page.getByTestId('query-sla')).toHaveText('OK')

      const persisted = await prisma.product.findFirst({
        where: { name, isDeleted: false },
      })
      expect(persisted).not.toBeNull()
      expect(persisted?.category).toBe('Electrónica')
      expect(Number(persisted?.price)).toBe(299.99)
      expect(persisted?.stock).toBe(42)
    } finally {
      // Limpieza (soft delete) aunque el test falle, para no ensuciar la BD
      await prisma.product.updateMany({
        where: { name, isDeleted: false },
        data: { isDeleted: true },
      })
    }
  })
})
