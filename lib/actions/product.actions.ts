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

export async function getPaginatedProducts(params: QueryProductInput) {
  const validated = QueryProductSchema.parse(params)
  const { page, limit, search, category, sortBy, sortOrder } = validated
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {
    isDeleted: false,
    ...(category && category !== 'ALL' ? { category } : {}),
    ...(search && search.trim() !== ''
      ? {
          name: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        }
      : {}),
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = {
    [sortBy]: sortOrder,
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
  }
}

export async function bulkUpdateCategoryPrices(data: unknown) {
  const validated = BulkUpdateSchema.parse(data)
  const factor = 1 + validated.pricePercentageChange / 100

  const updated = await prisma.product.updateMany({
    where: {
      category: validated.category,
      isDeleted: false,
    },
    data: {
      price: { multiply: factor },
    },
  })

  await prisma.product.updateMany({
    where: {
      category: validated.category,
      isDeleted: false,
      price: { lt: 0.01 },
    },
    data: { price: 0.01 },
  })

  revalidatePath('/dashboard/products')
  return { success: true, updated: updated.count }
}

export async function softDeleteProduct(id: string) {
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
