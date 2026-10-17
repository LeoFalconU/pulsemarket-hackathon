import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';

test.describe('Prueba E2E - Flujo de Productos', () => {
  test('Debe crear un producto físicamente en la BD y verificar su presencia en la interfaz', async ({ page }) => {
    const uniqueProductName = `Producto Test E2E - ${Date.now()}`;

    // 1. Creación física en la base de datos masiva
    const createdProduct = await prisma.product.create({
      data: {
        name: uniqueProductName,
        category: 'Electrónica',
        price: 299.99,
        stock: 42,
      },
    });

    // 2. Verificación física directa en la BD de Supabase
    const dbProduct = await prisma.product.findUnique({
      where: { id: createdProduct.id },
    });
    expect(dbProduct).not.toBeNull();
    expect(dbProduct?.name).toBe(uniqueProductName);

    // 3. Navegar a la vista de productos
    await page.goto('/dashboard/products');
    await page.waitForLoadState('networkidle');

    // 4. Buscar el producto recién creado
    const searchInput = page.getByPlaceholder(/buscar/i);
    await searchInput.fill(uniqueProductName);
    
    // Esperar a que la URL actualice el parámetro de búsqueda y la tabla re-renderice
    await page.waitForURL((url) => url.searchParams.get('search') === uniqueProductName);

    // 5. Verificar que el producto aparece en la tabla
    await expect(page.getByText(uniqueProductName)).toBeVisible({ timeout: 10000 });

    // Limpieza posterior de la prueba
    await prisma.product.delete({
      where: { id: createdProduct.id },
    });
  });
});