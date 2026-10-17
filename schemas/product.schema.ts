import { z } from 'zod'

export const productCategories = [
  'Electrónica',
  'Ropa',
  'Hogar',
  'Juguetes',
  'Deportes',
] as const

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres'),
  category: z.enum(productCategories),
  price: z.coerce.number().positive('El precio debe ser un número positivo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
})

export const BulkUpdateSchema = z.object({
  category: z.enum(productCategories),
  pricePercentageChange: z.coerce
    .number()
    .min(-50)
    .max(50)
    .refine((value) => value !== 0, {
      message: 'El porcentaje de cambio debe ser diferente de 0',
    }),
})

export const QueryProductSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'stock', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ProductInput = z.infer<typeof ProductSchema>
export type BulkUpdateInput = z.infer<typeof BulkUpdateSchema>
export type QueryProductInput = z.infer<typeof QueryProductSchema>
