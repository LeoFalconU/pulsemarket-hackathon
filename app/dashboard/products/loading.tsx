import { TableSkeleton } from '@/components/table-skeleton'

export default function ProductsLoading() {
  return (
    <main aria-label="Cargando productos" className="mx-auto w-full max-w-7xl space-y-4 p-5 md:p-8">
      <div className="h-9 w-48 animate-pulse rounded bg-zinc-200" />
      <TableSkeleton rows={10} />
    </main>
  )
}
