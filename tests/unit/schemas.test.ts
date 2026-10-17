import { describe, expect, it } from 'vitest'
import { kanbanMoveSchema } from '@/lib/validations/kanban'
import { productCreateSchema, productQuerySchema } from '@/lib/validations/product'

describe('DTOs Zod', () => {
  it('acepta un producto válido', () => {
    const parsed = productCreateSchema.parse({
      name: 'Monitor 27',
      category: 'Electrónica',
      price: '199.99',
      stock: '12',
    })
    expect(parsed.price).toBe(199.99)
    expect(parsed.stock).toBe(12)
  })

  it('rechaza un producto sin nombre útil', () => {
    const parsed = productCreateSchema.safeParse({
      name: 'AB',
      category: 'Ropa',
      price: 10,
      stock: 1,
    })
    expect(parsed.success).toBe(false)
  })

  it('usa paginación segura por defecto', () => {
    const parsed = productQuerySchema.parse({})
    expect(parsed.page).toBe(1)
    expect(parsed.pageSize).toBe(20)
  })

  it('valida un movimiento de kanban', () => {
    const parsed = kanbanMoveSchema.parse({
      id: 'task_1',
      status: 'DONE',
      position: 0,
    })
    expect(parsed.status).toBe('DONE')
  })
})
