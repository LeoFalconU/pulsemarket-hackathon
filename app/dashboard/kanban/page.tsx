import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { KanbanBoard } from '@/components/kanban-board'

export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
  const tasks = await prisma.kanbanTask.findMany({
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
    take: 100,
  })
  return <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-5 md:p-8">
    <header><Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">← Volver al dashboard</Link><h1 className="mt-3 text-3xl font-bold tracking-tight">Kanban de operaciones</h1><p className="mt-2 text-sm text-zinc-500">Arrastra cada tarjeta a otra columna. El cambio se guarda en la base de datos.</p></header>
    <KanbanBoard initialTasks={tasks} />
  </main>
}
