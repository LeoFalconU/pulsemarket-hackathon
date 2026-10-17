'use client'

import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { useState, useTransition } from 'react'
import { kanbanStatuses, type KanbanMoveInput } from '@/lib/validations/kanban'

type Task = { id: string; title: string; status: string; position: number }
const COLUMNS = [
  { id: 'TODO', label: 'Por hacer', hint: 'Pendiente de iniciar' },
  { id: 'IN_PROGRESS', label: 'En progreso', hint: 'Trabajo activo' },
  { id: 'DONE', label: 'Hecho', hint: 'Completado' },
] as const

export function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function persist(move: KanbanMoveInput): Promise<void> {
    const response = await fetch('/api/kanban', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(move) })
    if (!response.ok) throw new Error('No se pudo guardar el nuevo estado. Se restauró el tablero.')
  }

  function onDragEnd(result: DropResult) {
    setErrorMessage(null); setSuccessMessage(null)
    if (!result.destination) return
    if (result.destination.droppableId === result.source.droppableId && result.destination.index === result.source.index) return
    const status = kanbanStatuses.find((item) => item === result.destination?.droppableId)
    if (!status) return
    const id = result.draggableId
    const previous = tasks
    const nextStatusTasks = tasks.filter((task) => task.status === status && task.id !== id).sort((a, b) => a.position - b.position)
    const destinationIndex = Math.min(result.destination.index, nextStatusTasks.length)
    nextStatusTasks.splice(destinationIndex, 0, { ...tasks.find((task) => task.id === id)!, status, position: destinationIndex })
    const next = tasks.map((task) => {
      if (task.id === id) return { ...task, status, position: destinationIndex }
      if (task.status === status) {
        const newPosition = nextStatusTasks.findIndex((candidate) => candidate.id === task.id)
        return newPosition >= 0 ? { ...task, position: newPosition } : task
      }
      return task
    })
    setTasks(next)
    startTransition(async () => {
      try {
        await persist({ id, status, position: destinationIndex })
        setSuccessMessage('Cambio guardado correctamente.')
      } catch (error) {
        setTasks(previous)
        setErrorMessage(error instanceof Error ? error.message : 'Ocurrió un error al guardar.')
      }
    })
  }

  return <section aria-label="Tablero Kanban" className="space-y-3">
    <div className="flex min-h-6 items-center justify-between gap-3 text-sm" aria-live="polite">
      {isPending ? <span className="text-zinc-500">Guardando cambio…</span> : <span className="text-emerald-700">{successMessage}</span>}
      {errorMessage && <span role="alert" className="font-medium text-red-600">{errorMessage}</span>}
    </div>
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id).sort((a, b) => a.position - b.position)
          return <Droppable droppableId={column.id} key={column.id}>
            {(provided, snapshot) => <div ref={provided.innerRef} {...provided.droppableProps} data-testid={`kanban-column-${column.id}`} className={`min-h-72 rounded-2xl border p-3 transition-colors ${snapshot.isDraggingOver ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900'}`}>
              <div className="mb-4 flex items-start justify-between gap-2"><div><h2 className="font-semibold">{column.label}</h2><p className="mt-1 text-xs text-zinc-500">{column.hint}</p></div><span className="rounded-full bg-white px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800">{columnTasks.length}</span></div>
              {columnTasks.map((task, index) => <Draggable draggableId={task.id} index={index} key={task.id}>
                {(drag, dragSnapshot) => <article ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} data-testid={`kanban-card-${task.id}`} className={`mb-3 cursor-grab rounded-xl border bg-white p-4 text-sm shadow-sm transition-shadow active:cursor-grabbing dark:bg-zinc-950 ${dragSnapshot.isDragging ? 'border-indigo-400 shadow-lg' : 'border-zinc-200 dark:border-zinc-700'}`}><p className="font-medium">{task.title}</p><p className="mt-2 text-xs text-zinc-400">Arrastra para cambiar estado</p></article>}
              </Draggable>)}
              {provided.placeholder}
              {columnTasks.length === 0 && <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-400">Suelta una tarjeta aquí</p>}
            </div>}
          </Droppable>
        })}
      </div>
    </DragDropContext>
  </section>
}
