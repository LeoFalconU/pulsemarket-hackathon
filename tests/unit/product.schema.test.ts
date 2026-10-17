import { describe, expect, it } from 'vitest'
import {
  BulkUpdateSchema,
  ProductSchema,
  QueryProductSchema,
} from '@/schemas/product.schema'

describe('Zod de productos (creación, bulk y consulta)', () => {
  it('acepta un producto válido', () => {
    const parsed = ProductSchema.parse({
      name: 'Monitor 27',
      category: 'Electrónica',
      price: '199.99',
      stock: '12',
    })
    expect(parsed.price).toBe(199.99)
    expect(parsed.stock).toBe(12)
  })

  it('rechaza un producto con nombre corto', () => {
    const parsed = ProductSchema.safeParse({
      name: 'AB',
      category: 'Ropa',
      price: 10,
      stock: 1,
    })
    expect(parsed.success).toBe(false)
  })

  it('rechaza una categoría fuera del catálogo', () => {
    const parsed = ProductSchema.safeParse({
      name: 'Playera',
      category: 'Alimentos',
      price: 10,
      stock: 1,
    })
    expect(parsed.success).toBe(false)
  })

  it('valida un bulk update de precios', () => {
    const parsed = BulkUpdateSchema.parse({
      category: 'Hogar',
      pricePercentageChange: '10',
    })
    expect(parsed.pricePercentageChange).toBe(10)
  })

  it('rechaza un bulk update en 0%', () => {
    const parsed = BulkUpdateSchema.safeParse({
      category: 'Hogar',
      pricePercentageChange: 0,
    })
    expect(parsed.success).toBe(false)
  })

  it('usa paginación segura por defecto', () => {
    const parsed = QueryProductSchema.parse({})
    expect(parsed.page).toBe(1)
    expect(parsed.limit).toBe(10)
    expect(parsed.sortBy).toBe('createdAt')
  })

  it('limita el tamaño de página a 100', () => {
    const parsed = QueryProductSchema.safeParse({ page: 1, limit: 500 })
    expect(parsed.success).toBe(false)
  })
})
