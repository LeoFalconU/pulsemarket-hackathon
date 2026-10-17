export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function calculateSaleTotal(unitPrice: number, quantity: number) {
  if (unitPrice < 0 || quantity < 0) {
    throw new Error('El precio y la cantidad deben ser positivos')
  }
  return Number((unitPrice * quantity).toFixed(2))
}

export function applyBulkPercent(price: number, percent: number) {
  const next = price * (1 + percent / 100)
  return Number(Math.max(0.01, next).toFixed(2))
}

export function predictRestock(stock: number, dailySales: number, leadDays: number) {
  if (dailySales <= 0) {
    return { daysUntilStockout: Number.POSITIVE_INFINITY, shouldReorder: false }
  }
  const daysUntilStockout = stock / dailySales
  return {
    daysUntilStockout: Number(daysUntilStockout.toFixed(2)),
    shouldReorder: daysUntilStockout <= leadDays,
  }
}

export function grossMargin(revenue: number, cost: number) {
  if (revenue <= 0) {
    return 0
  }
  return Number((((revenue - cost) / revenue) * 100).toFixed(2))
}
