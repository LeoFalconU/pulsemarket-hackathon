import Link from 'next/link'
import { BulkPriceForm, ProductCreateForm } from '@/components/product-forms'
import { formatCurrency } from '@/lib/business'
import { listProductsPaged } from '@/lib/queries/products'
import { productQuerySchema } from '@/lib/validations/product'

export const dynamic = 'force-dynamic'

export default async function ProductsPage({
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
  const catalog = await listProductsPaged(query)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-5 md:p-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
            ← Volver al dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Productos</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Catálogo paginado · {catalog.durationMs} ms · {catalog.slaOk ? 'SLA OK' : 'Revisar rendimiento'}
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <ProductCreateForm />
        <BulkPriceForm />
      </section>

      <section>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {catalog.items.map((product) => (
                <tr key={product.id} data-testid="product-row" className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(product.price))}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
