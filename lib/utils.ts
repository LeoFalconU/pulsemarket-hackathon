// Formateador de moneda
export function formatCurrency(amount: number | string, currency = 'USD'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(numericAmount);
}

// Cálculo de margen de ganancia (%)
export function calculateProfitMargin(cost: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return Number((((sellingPrice - cost) / sellingPrice) * 100).toFixed(2));
}

// Algoritmo predictivo de inventario (días para agotarse)
export function predictDaysUntilOutOfStock(currentStock: number, averageDailySales: number): number {
  if (averageDailySales <= 0) return Infinity;
  if (currentStock <= 0) return 0;
  return Math.floor(currentStock / averageDailySales);
}