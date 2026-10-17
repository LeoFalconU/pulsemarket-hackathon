import { TableSkeleton } from '@/components/table-skeleton'

export default function DashboardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-200" />
      <TableSkeleton />
    </main>
  )
}
