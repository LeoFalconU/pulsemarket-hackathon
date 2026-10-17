import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  bulkUpdateCategoryPrices,
  createProduct,
  getPaginatedProducts,
  softDeleteProduct,
} from '@/lib/actions/product.actions'
import { QueryProductSchema } from '@/schemas/product.schema'

const mocks = vi.hoisted(() => ({
  getAuthSession: vi.fn(),
  productFindMany: vi.fn(),
  productCount: vi.fn(),
  productUpdateMany: vi.fn(),
  productUpdate: vi.fn(),
  productCreate: vi.fn(),
}))

vi.mock('@/lib/session', () => ({
  getAuthSession: mocks.getAuthSession,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: mocks.productFindMany,
      count: mocks.productCount,
      updateMany: mocks.productUpdateMany,
      update: mocks.productUpdate,
      create: mocks.productCreate,
    },
  },
}))

describe('product server actions authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAuthSession.mockResolvedValue(null)
  })

  it.each([
    ['list products', () => getPaginatedProducts(QueryProductSchema.parse({}))],
    ['bulk update prices', () => bulkUpdateCategoryPrices({})],
    ['soft delete a product', () => softDeleteProduct('product-id')],
    ['create a product', () => createProduct({})],
  ])('rejects anonymous attempts to %s', async (_action, invoke) => {
    await expect(invoke()).rejects.toThrow('No autorizado')
    expect(mocks.productFindMany).not.toHaveBeenCalled()
    expect(mocks.productCount).not.toHaveBeenCalled()
    expect(mocks.productUpdateMany).not.toHaveBeenCalled()
    expect(mocks.productUpdate).not.toHaveBeenCalled()
    expect(mocks.productCreate).not.toHaveBeenCalled()
  })
})
