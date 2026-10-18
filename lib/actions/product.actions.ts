'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  BulkUpdateSchema,
  ProductSchema,
  QueryProductSchema,
  type QueryProductInput,
} from '@/schemas/product.schema'
import { revalidatePath } from 'next/cache'
import { getAuthSession } from '@/lib/session'

async function requireAuthenticatedSession(): Promise<void> {
  if (!(await getAuthSession())) {
    throw new Error('No autorizado')
  }
}

export async function getPaginatedProducts(params: QueryProductInput) {
  await requireAuthenticatedSession()
  const startedAt = performance.now()
  const validated = QueryProductSchema.parse(params)
  const { page, limit, search, category, sortBy, sortOrder } = validated
  const skip = (page - 1) * limit

  // 1. Definimos el 'where' con su tipo estricto, incluyendo solo la condición por defecto
  const where: Prisma.ProductWhereInput = {
    isDeleted: false,
  }

  // 2. Agregamos propiedades dinámicamente de forma estricta (evita los problemáticos spreads `{...}`)
  if (category && category !== 'ALL') {
    where.category = category
  }

  const cleanSearch = search?.trim()
  if (cleanSearch) {
    where.name = {
      contains: cleanSearch,
      mode: 'insensitive',
    }
  }

  // 3. Tipado estricto para las llaves del orderBy
  const orderBy: Prisma.ProductOrderByWithRelationInput = {
    [sortBy as keyof Prisma.ProductOrderByWithRelationInput]: sortOrder,
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      take: limit,
      skip,
      orderBy,
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
  ])

  return {
    products: products.map((product) => ({
      ...product,
      price: Number(product.price),
    })),
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    durationMs: Math.round(performance.now() - startedAt),
  }
}

export async function bulkUpdateCategoryPrices(data: unknown) {
  await requireAuthenticatedSession()
  const validated = BulkUpdateSchema.parse(data)
  const factor = 1 + validated.pricePercentageChange / 100

  const updated = await prisma.product.updateMany({
    where: {
      category: validated.category,
      isDeleted: false,
    } satisfies Prisma.ProductWhereInput, // Usamos 'satisfies' para doble seguridad sin perder la inferencia
    data: {
      price: { multiply: factor },
    },
  })

  await prisma.product.updateMany({
    where: {
      category: validated.category,
      isDeleted: false,
      price: { lt: 0.01 },
    } satisfies Prisma.ProductWhereInput,
    data: { price: 0.01 },
  })

  revalidatePath('/dashboard/products')
  return { success: true, updated: updated.count }
}

export async function softDeleteProduct(id: string) {
  await requireAuthenticatedSession()
  await prisma.product.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  })

  revalidatePath('/dashboard/products')
  return { success: true }
}

export async function createProduct(data: unknown) {
  await requireAuthenticatedSession()
  const validated = ProductSchema.parse(data)

  const product = await prisma.product.create({
    data: {
      name: validated.name,
      category: validated.category,
      price: validated.price,
      stock: validated.stock,
    },
  })

  revalidatePath('/dashboard/products')
  return {
    ...product,
    price: Number(product.price),
  }
}