import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { ProductQueryInput } from '@/lib/validations/product'

const MAX_QUERY_MS = 400

export async function listProductsPaged(query: ProductQueryInput) {
  const where: Prisma.ProductWhereInput = {
    isDeleted: false,
    ...(query.category ? { category: query.category } : {}),
    ...(query.q
      ? {
          name: {
            contains: query.q,
            mode: 'insensitive',
          },
        }
      : {}),
  }

  const started = performance.now()
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
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
  const durationMs = Number((performance.now() - started).toFixed(2))

  return {
    items: items.map((item) => ({
      ...item,
      price: item.price.toString(),
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
    durationMs,
    slaOk: durationMs < MAX_QUERY_MS,
  }
}
