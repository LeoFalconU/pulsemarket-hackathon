import { KanbanBoard } from '@/components/kanban-board'
import { BulkPriceForm, ProductCreateForm } from '@/components/product-forms'
import { prisma } from '@/lib/prisma'
import { listProductsPaged } from '@/lib/queries/products'
import { productQuerySchema } from '@/lib/validations/product'
import { formatCurrency } from '@/lib/business'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>
}) {
  const params = await searchParams
  const query = productQuerySchema.parse({
    page: params.page,
    category: params.category || undefined,
    q: params.q || undefined,
    pageSize: 20,
  })

  const [catalog, tasks, salesAgg] = await Promise.all([
    listProductsPaged(query),
    prisma.kanbanTask.findMany({ orderBy: [{ status: 'asc' }, { position: 'asc' }] }),
    prisma.sale.aggregate({
      _sum: { total: true },
      _count: { _all: true },
    }),
  ])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard PulseMarket</h1>
        <p className="text-sm text-zinc-600">
          Consulta paginada en {catalog.durationMs} ms · SLA 400 ms:{' '}
          <strong data-testid="query-sla">{catalog.slaOk ? 'OK' : 'FALLÓ'}</strong>
        </p>
        <p className="text-sm text-zinc-600">
          Ventas indexadas: {salesAgg._count._all} · Ingreso:{' '}
          {formatCurrency(Number(salesAgg._sum.total ?? 0))}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <ProductCreateForm />
        <BulkPriceForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Catálogo paginado</h2>
        <table className="w-full overflow-hidden rounded-xl border border-zinc-200 text-sm dark:border-zinc-800">
          <thead className="bg-zinc-100 text-left dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {catalog.items.map((product) => (
              <tr key={product.id} data-testid="product-row" className="border-t border-zinc-100">
                <td className="px-3 py-2">{product.name}</td>
                <td className="px-3 py-2">{product.category}</td>
                <td className="px-3 py-2">{formatCurrency(Number(product.price))}</td>
                <td className="px-3 py-2">{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-zinc-500">
          Página {catalog.page} · {catalog.total} registros activos (sin bajas físicas)
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Kanban de operaciones</h2>
        <KanbanBoard initialTasks={tasks} />
      </section>
    </main>
  )
}
