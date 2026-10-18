import { describe, expect, it } from 'vitest'
import {
  kanbanCreateSchema,
  kanbanDeleteSchema,
  kanbanMoveSchema,
  kanbanUpdateSchema,
} from '@/lib/validations/kanban'
import { bulkPriceUpdateSchema, productCreateSchema, productQuerySchema } from '@/lib/validations/product'

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

  it('valida y normaliza el título al crear una tarjeta Kanban', () => {
    const parsed = kanbanCreateSchema.parse({ title: '  Revisar inventario  ' })
    expect(parsed.title).toBe('Revisar inventario')
  })

  it('rechaza títulos Kanban demasiado largos', () => {
    const parsed = kanbanCreateSchema.safeParse({ title: 'x'.repeat(121) })
    expect(parsed.success).toBe(false)
  })

  it('valida la edición y el borrado de tarjetas Kanban', () => {
    expect(kanbanUpdateSchema.parse({ id: 'task_1', title: 'Actualizar inventario' }).id).toBe(
      'task_1',
    )
    expect(kanbanDeleteSchema.parse({ id: 'task_1' }).id).toBe('task_1')
    expect(kanbanDeleteSchema.safeParse({ id: '' }).success).toBe(false)
  })

  it('valida un bulk update de precios', () => {
    const parsed = bulkPriceUpdateSchema.parse({
      category: 'Hogar',
      percent: '10',
    })
    expect(parsed.percent).toBe(10)
  })
})
