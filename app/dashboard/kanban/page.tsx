import { KanbanBoard } from '@/components/kanban-board'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
  const tasks = await prisma.kanbanTask.findMany({
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
    take: 100,
  })

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Kanban de operaciones</h1>
        <p className="text-sm text-zinc-600">Arrastra las tareas para actualizar su estado.</p>
      </header>
      <KanbanBoard initialTasks={tasks} />
    </main>
  )
}