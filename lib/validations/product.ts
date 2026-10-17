import { z } from 'zod'

export const productCategories = [
  'Electrónica',
  'Ropa',
  'Hogar',
  'Juguetes',
  'Deportes',
] as const

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(50).catch(20),
  category: z.enum(productCategories).optional(),
  q: z.string().trim().max(80).optional(),
})

export const productCreateSchema = z.object({
  name: z.string().trim().min(3).max(80),
  category: z.enum(productCategories),
  price: z.coerce.number().positive().max(1_000_000),
  stock: z.coerce.number().int().min(0).max(1_000_000),
})

export const bulkPriceUpdateSchema = z.object({
  category: z.enum(productCategories),
  percent: z.coerce.number().min(-50).max(50),
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>
export type BulkPriceUpdateInput = z.infer<typeof bulkPriceUpdateSchema>
