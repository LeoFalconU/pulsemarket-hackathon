import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/session'
import { listProductsPaged } from '@/lib/queries/products'
import {
  bulkPriceUpdateSchema,
  productCreateSchema,
  productQuerySchema,
} from '@/lib/validations/product'

async function requireSession() {
  const session = await getAuthSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return null
}

export async function GET(request: Request) {
  const unauthorized = await requireSession()
  if (unauthorized) {
    return unauthorized
  }

  const url = new URL(request.url)
  const parsed = productQuerySchema.safeParse({
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined,
    category: url.searchParams.get('category') || undefined,
    q: url.searchParams.get('q') || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const result = await listProductsPaged(parsed.data)
  return NextResponse.json(result, {
    headers: { 'X-Query-Time-Ms': String(result.durationMs) },
  })
}

export async function POST(request: Request) {
  const unauthorized = await requireSession()
  if (unauthorized) {
    return unauthorized
  }

  const body: unknown = await request.json()
  const parsed = productCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      price: new Prisma.Decimal(parsed.data.price),
      stock: parsed.data.stock,
    },
  })

  return NextResponse.json({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price.toString(),
    stock: product.stock,
  }, { status: 201 })
}

export async function PATCH(request: Request) {
  const unauthorized = await requireSession()
  if (unauthorized) {
    return unauthorized
  }

  const body: unknown = await request.json()
  const parsed = bulkPriceUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const factor = 1 + parsed.data.percent / 100
  const updated = await prisma.product.updateMany({
    where: {
      category: parsed.data.category,
      isDeleted: false,
    },
    data: {
      price: { multiply: factor },
    },
  })

  await prisma.product.updateMany({
    where: {
      category: parsed.data.category,
      isDeleted: false,
      price: { lt: 0.01 },
    },
    data: { price: 0.01 },
  })

  return NextResponse.json({ updated: updated.count })
}
