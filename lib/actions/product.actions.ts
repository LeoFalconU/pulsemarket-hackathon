'use server';

import { prisma } from '@/lib/prisma';
import {
  ProductSchema,
  BulkUpdateSchema,
  QueryProductSchema,
  QueryProductInput,
} from '@/schemas/product.schema';
import { revalidatePath } from 'next/cache';

// --------------------------------------------------------------------------
// TAREA 3: Consultas paginadas, filtradas y ordenadas (<400ms)
// --------------------------------------------------------------------------
export async function getPaginatedProducts(params: QueryProductInput) {
  const validated = QueryProductSchema.parse(params);
  const { page, limit, search, category, sortBy, sortOrder } = validated;

  const skip = (page - 1) * limit;

  // Filtro base: Excluir productos borrados lógicamente (Soft Delete)
  const where: any = {
    isDeleted: false,
  };

  if (category && category !== 'ALL') {
    where.category = category;
  }

  if (search && search.trim() !== '') {
    where.name = {
      contains: search.trim(),
      mode: 'insensitive',
    };
  }

  // Consulta optimizada aprovechando los índices del esquema Prisma
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        stock: true,
        createdAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Serialización de Decimal a Number/String para Next.js
  const formattedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  return {
    products: formattedProducts,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

// --------------------------------------------------------------------------
// TAREA 4: Operación Masiva (Bulk Update)
// --------------------------------------------------------------------------
export async function bulkUpdateCategoryPrices(data: unknown) {
  const validated = BulkUpdateSchema.parse(data);
  const factor = 1 + validated.pricePercentageChange / 100;

  // Actualización masiva directa en la base de datos
  await prisma.$executeRaw`
    UPDATE "Product"
    SET "price" = "price" * ${factor}
    WHERE "category" = ${validated.category} AND "isDeleted" = false
  `;

  revalidatePath('/dashboard/products');
  return { success: true };
}

// --------------------------------------------------------------------------
// TAREA 5: Borrado Seguro (Soft Delete)
// --------------------------------------------------------------------------
export async function softDeleteProduct(id: string) {
  await prisma.product.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  revalidatePath('/dashboard/products');
  return { success: true };
}

// --------------------------------------------------------------------------
// Para la Prueba E2E (Creación de Producto)
// --------------------------------------------------------------------------
export async function createProduct(data: unknown) {
  const validated = ProductSchema.parse(data);

  const product = await prisma.product.create({
    data: {
      name: validated.name,
      category: validated.category,
      price: validated.price,
      stock: validated.stock,
    },
  });

  revalidatePath('/dashboard/products');
  return {
    ...product,
    price: Number(product.price),
  };
}