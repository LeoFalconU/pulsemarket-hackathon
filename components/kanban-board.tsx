'use client'

import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { useState, useTransition, type FormEvent } from 'react'
import {
  kanbanStatuses,
  type KanbanMoveInput,
} from '@/lib/validations/kanban'

type Task = { id: string; title: string; status: string; position: number }

const COLUMNS = [
  { id: 'TODO', label: 'Por hacer', hint: 'Pendiente de iniciar', accent: 'bg-violet-500' },
  { id: 'IN_PROGRESS', label: 'En progreso', hint: 'Trabajo activo', accent: 'bg-sky-500' },
  { id: 'DONE', label: 'Hecho', hint: 'Completado', accent: 'bg-emerald-500' },
] as const

function isTask(value: unknown): value is Task {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'status' in value &&
    typeof value.status === 'string' &&
    'position' in value &&
    typeof value.position === 'number'
  )
}

async function getTask(response: Response): Promise<Task> {
  const payload: unknown = await response.json()
  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'No se pudo guardar el cambio.'
    throw new Error(message)
  }
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('task' in payload) ||
    !isTask(payload.task)
  ) {
    throw new Error('El servidor devolvió una tarjeta inválida.')
  }
  return payload.task
}

async function persistMove(move: KanbanMoveInput): Promise<void> {
  const response = await fetch('/api/kanban', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(move),
  })
  await getTask(response)
}

export function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isMutating, setIsMutating] = useState(false)

  function clearFeedback() {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearFeedback()
    setIsMutating(true)
    try {
      const response = await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })
      const task = await getTask(response)
      setTasks((current) => [...current, task])
      setNewTitle('')
      setSuccessMessage('Tarjeta creada.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear la tarjeta.')
    } finally {
      setIsMutating(false)
    }
  }

  async function updateTask(id: string) {
    clearFeedback()
    setIsMutating(true)
    try {
      const response = await fetch('/api/kanban', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: editingTitle }),
      })
      const updatedTask = await getTask(response)
      setTasks((current) =>
        current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      )
      setEditingId(null)
      setSuccessMessage('Tarjeta actualizada.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo editar la tarjeta.')
    } finally {
      setIsMutating(false)
    }
  }

  async function deleteTask(id: string) {
    if (!window.confirm('¿Eliminar esta tarjeta del tablero?')) return
    clearFeedback()
    setIsMutating(true)
    try {
      const response = await fetch('/api/kanban', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const payload: unknown = await response.json()
      if (!response.ok) {
        const message =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof payload.error === 'string'
            ? payload.error
            : 'No se pudo eliminar la tarjeta.'
        throw new Error(message)
      }
      setTasks((current) => current.filter((task) => task.id !== id))
      setSuccessMessage('Tarjeta eliminada.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo eliminar la tarjeta.')
    } finally {
      setIsMutating(false)
    }
  }

  function onDragEnd(result: DropResult) {
    clearFeedback()
    if (!result.destination) return
    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return
    }
    const status = kanbanStatuses.find((item) => item === result.destination?.droppableId)
    if (!status) return
    const movedTask = tasks.find((task) => task.id === result.draggableId)
    if (!movedTask) return

    const previous = tasks
    const nextStatusTasks = tasks
      .filter((task) => task.status === status && task.id !== movedTask.id)
      .sort((a, b) => a.position - b.position)
    const destinationIndex = Math.min(result.destination.index, nextStatusTasks.length)
    nextStatusTasks.splice(destinationIndex, 0, {
      ...movedTask,
      status,
      position: destinationIndex,
    })
    const next = tasks.map((task) => {
      if (task.id === movedTask.id) return { ...task, status, position: destinationIndex }
      if (task.status !== status) return task
      const position = nextStatusTasks.findIndex((candidate) => candidate.id === task.id)
      return position >= 0 ? { ...task, position } : task
    })
    setTasks(next)

    startTransition(async () => {
      try {
        await persistMove({ id: movedTask.id, status, position: destinationIndex })
        setSuccessMessage('Movimiento guardado.')
      } catch (error) {
        setTasks(previous)
        setErrorMessage(error instanceof Error ? error.message : 'No se pudo mover la tarjeta.')
      }
    })
  }

  return (
    <section aria-label="Tablero Kanban" className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Administrar tareas</p>
          <p className="mt-1 text-xs text-zinc-500">
            Crea tarjetas y muévelas entre columnas para actualizar su estado.
          </p>
        </div>
        <form onSubmit={createTask} className="flex w-full gap-2 sm:max-w-xl">
          <label htmlFor="kanban-new-title" className="sr-only">
            Título de la nueva tarjeta
          </label>
          <input
            id="kanban-new-title"
            data-testid="kanban-new-title"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            minLength={3}
            maxLength={120}
            required
            placeholder="Ej. Revisar pedido pendiente"
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            data-testid="kanban-create"
            disabled={isMutating || isPending}
            className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isMutating ? 'Guardando…' : 'Nueva tarjeta'}
          </button>
        </form>
      </div>

      <div className="flex min-h-6 items-center justify-between gap-3 text-sm" aria-live="polite">
        <span className={errorMessage ? 'text-red-600' : 'text-emerald-700'} role={errorMessage ? 'alert' : 'status'}>
          {errorMessage ?? successMessage ?? (isPending ? 'Guardando movimiento…' : '')}
        </span>
        <span className="text-xs text-zinc-500">{tasks.length} tarjetas</span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((column, columnIndex) => {
            const columnTasks = tasks
              .filter((task) => task.status === column.id)
              .sort((a, b) => a.position - b.position)
            return (
              <Droppable droppableId={column.id} key={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    data-testid={`kanban-column-${column.id}`}
                    className={`min-h-80 rounded-2xl border p-3 transition duration-200 ${
                      snapshot.isDraggingOver
                        ? 'scale-[1.01] border-indigo-400 bg-indigo-50 shadow-inner dark:bg-indigo-950/30'
                        : 'border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/70'
                    } motion-rise`}
                    style={{ animationDelay: `${columnIndex * 70}ms` }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-2 px-1">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${column.accent}`} />
                        <div>
                          <h2 className="font-semibold">{column.label}</h2>
                          <p className="mt-1 text-xs text-zinc-500">{column.hint}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600 shadow-sm dark:bg-zinc-800 dark:text-zinc-300">
                        {columnTasks.length}
                      </span>
                    </div>
                    {columnTasks.map((task, index) => (
                      <Draggable
                        draggableId={task.id}
                        index={index}
                        key={task.id}
                        isDragDisabled={isMutating || isPending || editingId !== null}
                      >
                        {(drag, dragSnapshot) => (
                          <article
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            data-testid={`kanban-card-${task.id}`}
                            className={`group mb-3 rounded-xl border bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-950 ${
                              dragSnapshot.isDragging
                                ? 'rotate-1 border-indigo-400 shadow-xl'
                                : 'border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            {editingId === task.id ? (
                              <form
                                onSubmit={(event) => {
                                  event.preventDefault()
                                  void updateTask(task.id)
                                }}
                                className="space-y-3"
                              >
                                <label htmlFor={`edit-${task.id}`} className="sr-only">
                                  Editar título de tarjeta
                                </label>
                                <input
                                  id={`edit-${task.id}`}
                                  data-testid="kanban-edit-title"
                                  value={editingTitle}
                                  onChange={(event) => setEditingTitle(event.target.value)}
                                  minLength={3}
                                  maxLength={120}
                                  required
                                  autoFocus
                                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-900"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    data-testid="kanban-save-edit"
                                    disabled={isMutating}
                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div
                                  {...drag.dragHandleProps}
                                  data-testid={`kanban-card-handle-${task.id}`}
                                  className="cursor-grab rounded-lg active:cursor-grabbing"
                                  aria-label={`Arrastrar ${task.title}`}
                                >
                                  <p className="font-medium leading-5">{task.title}</p>
                                  <p className="mt-2 text-xs text-zinc-400">Arrastra para cambiar estado</p>
                                </div>
                                <div className="mt-3 flex justify-end gap-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                                  <button
                                    type="button"
                                    data-testid="kanban-edit"
                                    disabled={isMutating || isPending}
                                    onClick={() => {
                                      setEditingId(task.id)
                                      setEditingTitle(task.title)
                                      clearFeedback()
                                    }}
                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    data-testid="kanban-delete"
                                    disabled={isMutating || isPending}
                                    onClick={() => void deleteTask(task.id)}
                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </>
                            )}
                          </article>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {columnTasks.length === 0 && (
                      <p className="rounded-xl border border-dashed border-zinc-300 bg-white/60 p-6 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/40">
                        Suelta una tarjeta aquí
                      </p>
                    )}
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>
    </section>
  )
}
