import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';

test.describe('Prueba E2E - Flujo de Productos', () => {
  test('Debe crear un producto físicamente en la BD y verificar su presencia en la interfaz', async ({ page }) => {
    const uniqueProductName = `Producto Test E2E - ${Date.now()}`;

    // 1. Creación física en la base de datos
    const createdProduct = await prisma.product.create({
      data: {
        name: uniqueProductName,
        category: 'Electrónica',
        price: 299.99,
        stock: 42,
      },
    });

    // 2. Verificación física directa en Supabase
    const dbProduct = await prisma.product.findUnique({
      where: { id: createdProduct.id },
    });
    expect(dbProduct).not.toBeNull();
    expect(dbProduct?.name).toBe(uniqueProductName);

    // 3. Ir a la vista de productos
    await page.goto('/dashboard/products');
    await page.waitForLoadState('domcontentloaded');

    // 4. Buscar el producto recién creado
    const searchInput = page.getByPlaceholder(/buscar/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill(uniqueProductName);

    // 5. Confirmar que el elemento aparece en la UI
    await expect(page.getByText(uniqueProductName)).toBeVisible({ timeout: 10000 });

    // Limpieza posterior
    await prisma.product.delete({
      where: { id: createdProduct.id },
    });
  });
});