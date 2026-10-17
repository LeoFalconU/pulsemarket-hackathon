import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency, predictRestock } from '@/lib/business'
import { KanbanBoard } from '@/components/kanban-board'
import { ProductCreateForm, BulkPriceForm } from '@/components/product-forms'
import { listProductsPaged } from '@/lib/queries/products'
import { productQuerySchema } from '@/lib/validations/product'

export const dynamic = 'force-dynamic'

function MetricCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <p className="text-sm text-zinc-500">{title}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-zinc-500">{detail}</p>
  </article>
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; q?: string }> }) {
  const params = await searchParams
  const query = productQuerySchema.parse({ page: params.page, category: params.category || undefined, q: params.q || undefined, pageSize: 20 })
  const started = performance.now()
  const [catalog, tasks, salesAgg, customersCount, productsCount, recentSales, dailySales, stockProducts] = await Promise.all([
    listProductsPaged(query),
    prisma.kanbanTask.findMany({ orderBy: [{ status: 'asc' }, { position: 'asc' }] }),
    prisma.sale.aggregate({ _sum: { total: true }, _count: { _all: true } }),
    prisma.customer.count(),
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.sale.findMany({ take: 6, orderBy: { createdAt: 'desc' }, select: { id: true, total: true, status: true, createdAt: true, product: { select: { name: true } }, customer: { select: { name: true } } } }),
    prisma.sale.findMany({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, select: { total: true, createdAt: true } }),
    prisma.product.findMany({ where: { isDeleted: false }, take: 100, orderBy: { stock: 'asc' }, select: { id: true, name: true, stock: true, sales: { where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, select: { quantity: true } } } }),
  ])
  const queryMs = Math.round(performance.now() - started)
  const revenue = Number(salesAgg._sum.total ?? 0)
  const weekBuckets = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index))
    const amount = dailySales.filter((sale) => new Date(sale.createdAt).toDateString() === date.toDateString()).reduce((sum, sale) => sum + Number(sale.total), 0)
    return { label: date.toLocaleDateString('es-MX', { weekday: 'short' }), amount }
  })
  const maxDailyRevenue = Math.max(1, ...weekBuckets.map((day) => day.amount))
  const inventoryAlerts = stockProducts.map((product) => {
    const sold = product.sales.reduce((sum, sale) => sum + sale.quantity, 0)
    const prediction = predictRestock(product.stock, sold / 30, 7)
    return { id: product.id, name: product.name, stock: product.stock, days: prediction.daysUntilStockout, shouldReorder: prediction.shouldReorder }
  }).filter((product) => product.shouldReorder || product.stock <= 5).slice(0, 5)

  return <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-5 md:p-8">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-medium text-indigo-600">PULSEMARKET / ANALÍTICA</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard de negocio</h1><p className="mt-2 text-sm text-zinc-500">Resumen de ventas, clientes e inventario.</p></div>
      <Link href="/dashboard/kanban" className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700">Abrir tablero Kanban →</Link>
    </header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Ingresos acumulados" value={formatCurrency(revenue)} detail="Suma de ventas registradas" />
      <MetricCard title="Ventas registradas" value={salesAgg._count._all.toLocaleString('es-MX')} detail="Transacciones en la base de datos" />
      <MetricCard title="Clientes" value={customersCount.toLocaleString('es-MX')} detail="Clientes registrados" />
      <MetricCard title="Productos activos" value={productsCount.toLocaleString('es-MX')} detail={`Consulta de catálogo: ${catalog.durationMs} ms · agregados: ${queryMs} ms`} />
    </section>

    <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <article className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Ingresos de los últimos 7 días</h2><p className="text-xs text-zinc-500">Agrupación diaria de ventas</p></div><span data-testid="query-sla" className={`rounded-full px-3 py-1 text-xs ${catalog.slaOk && queryMs < 400 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{catalog.slaOk && queryMs < 400 ? 'SLA < 400 ms' : 'Revisar rendimiento'}</span></div>
        <div className="flex h-48 items-end gap-3 border-b border-zinc-100 pb-2" aria-label="Gráfica de ingresos por día">
          {weekBuckets.map((day) => <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div title={formatCurrency(day.amount)} className="w-full max-w-12 rounded-t-md bg-indigo-500 transition-all" style={{ height: `${Math.max(4, (day.amount / maxDailyRevenue) * 82)}%` }} /><span className="text-xs text-zinc-500">{day.label}</span></div>)}
        </div><p className="mt-3 text-xs text-zinc-500">Los importes se consultan en el servidor; el navegador no descarga todo el historial.</p>
      </article>
      <article className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"><h2 className="font-semibold">Proyección de inventario</h2><p className="mb-4 mt-1 text-xs text-zinc-500">Estimación heurística usando ventas de los últimos 30 días; no es un modelo generativo.</p>
        {inventoryAlerts.length ? <ul className="space-y-3">{inventoryAlerts.map((product) => <li key={product.id} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900"><div><p className="text-sm font-medium">{product.name}</p><p className="text-xs text-zinc-500">Stock actual: {product.stock}</p></div><span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800">{Number.isFinite(product.days) ? `${product.days} días` : 'Sin ventas'}</span></li>)}</ul> : <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">No se detectan productos con riesgo inmediato de agotamiento en la muestra consultada.</p>}
      </article>
    </section>

    <section className="grid gap-4 md:grid-cols-2"><ProductCreateForm /><BulkPriceForm /></section>

    <section><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Ventas recientes</h2><span className="text-xs text-zinc-500">6 registros como máximo</span></div>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800"><table className="w-full text-left text-sm"><thead className="bg-zinc-100 dark:bg-zinc-900"><tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Total</th></tr></thead><tbody>{recentSales.map((sale) => <tr key={sale.id} className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-4 py-3">{sale.customer.name}</td><td className="px-4 py-3">{sale.product.name}</td><td className="px-4 py-3">{new Date(sale.createdAt).toLocaleDateString('es-MX')}</td><td className="px-4 py-3">{sale.status}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(sale.total))}</td></tr>)}{recentSales.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Todavía no hay ventas registradas.</td></tr>}</tbody></table></div>
    </section>

    <section><div className="mb-3 flex items-center justify-between"><div><h2 className="text-xl font-semibold">Catálogo paginado</h2><p className="text-xs text-zinc-500">Página {catalog.page} de {Math.max(1, Math.ceil(catalog.total / 20))} · {catalog.total} productos activos</p></div></div>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800"><table className="w-full text-left text-sm"><thead className="bg-zinc-100 dark:bg-zinc-900"><tr><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Precio</th><th className="px-4 py-3">Stock</th></tr></thead><tbody>{catalog.items.map((product) => <tr key={product.id} data-testid="product-row" className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-4 py-3">{product.name}</td><td className="px-4 py-3">{product.category}</td><td className="px-4 py-3">{formatCurrency(Number(product.price))}</td><td className="px-4 py-3">{product.stock}</td></tr>)}</tbody></table></div>
      <div className="mt-3 flex gap-3 text-sm">{catalog.page > 1 && <Link className="rounded-lg border px-3 py-2" href={`/dashboard?page=${catalog.page - 1}`}>← Anterior</Link>}{catalog.page * 20 < catalog.total && <Link className="rounded-lg border px-3 py-2" href={`/dashboard?page=${catalog.page + 1}`}>Siguiente →</Link>}</div>
    </section>
    <section><h2 className="mb-3 text-xl font-semibold">Vista rápida de operaciones</h2><KanbanBoard initialTasks={tasks} /></section>
  </main>
}
