import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { KanbanBoard } from '@/components/kanban-board'

export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
  const tasks = await prisma.kanbanTask.findMany({
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
    take: 100,
  })
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-7">
      <header className="motion-rise">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:gap-3 dark:text-indigo-400"
        >
          <span aria-hidden="true">←</span> Volver al dashboard
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Flujo de trabajo
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Kanban de operaciones
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Organiza inventario y tareas del equipo. Los cambios se guardan en PostgreSQL.
            </p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            Sincronizado con la base de datos
          </span>
        </div>
      </header>
      <KanbanBoard initialTasks={tasks} />
    </main>
  )
}
