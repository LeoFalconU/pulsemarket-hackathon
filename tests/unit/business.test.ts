import { describe, expect, it } from 'vitest'
import {
  applyBulkPercent,
  calculateSaleTotal,
  formatCurrency,
  grossMargin,
  predictRestock,
} from '@/lib/business'

describe('utilidades de negocio PulseMarket', () => {
  it('formatea moneda en es-MX', () => {
    expect(formatCurrency(1299.5)).toMatch(/1,299.50/)
  })

  it('calcula el total de una venta', () => {
    expect(calculateSaleTotal(19.99, 3)).toBe(59.97)
  })

  it('rechaza cantidades negativas', () => {
    expect(() => calculateSaleTotal(10, -1)).toThrow(/positivos/)
  })

  it('aplica un incremento masivo de precios', () => {
    expect(applyBulkPercent(100, 10)).toBe(110)
  })

  it('no permite precios en cero tras un descuento agresivo', () => {
    expect(applyBulkPercent(0.02, -90)).toBe(0.01)
  })

  it('predice reorden cuando el stock no cubre el lead time', () => {
    expect(predictRestock(10, 5, 3)).toEqual({
      daysUntilStockout: 2,
      shouldReorder: true,
    })
  })

  it('no pide reorden si no hay ventas diarias', () => {
    expect(predictRestock(8, 0, 4).shouldReorder).toBe(false)
  })

  it('calcula margen bruto', () => {
    expect(grossMargin(200, 50)).toBe(75)
  })

  it('margen bruto es 0 si no hay ingreso', () => {
    expect(grossMargin(0, 50)).toBe(0)
  })
})
