'use client'

import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { useOptimistic, useState, useTransition } from 'react'
import { kanbanStatuses, type KanbanMoveInput } from '@/lib/validations/kanban'

type Task = {
  id: string
  title: string
  status: string
  position: number
}

const COLUMNS = [
  { id: 'TODO', label: 'Por hacer' },
  { id: 'IN_PROGRESS', label: 'En progreso' },
  { id: 'DONE', label: 'Hecho' },
] as const

export function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(tasks)
  const [, startTransition] = useTransition()

  function columnTasks(status: string) {
    return optimisticTasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.position - b.position)
  }

  async function persist(move: KanbanMoveInput) {
    const response = await fetch('/api/kanban', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(move),
    })
    if (!response.ok) {
      throw new Error('No se pudo persistir el tablero')
    }
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return
    }

    const status = kanbanStatuses.find((item) => item === result.destination?.droppableId)
    const position = result.destination.index
    const id = result.draggableId
    if (!status) {
      return
    }

    const next = tasks.map((task) =>
      task.id === id ? { ...task, status, position } : task,
    )
    setTasks(next)

    startTransition(async () => {
      setOptimisticTasks(next)
      try {
        await persist({ id, status, position })
      } catch {
        setTasks(initialTasks)
      }
    })
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <Droppable droppableId={column.id} key={column.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                data-testid={`kanban-column-${column.id}`}
                className="min-h-64 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="mb-3 text-sm font-semibold">{column.label}</h3>
                {columnTasks(column.id).map((task, index) => (
                  <Draggable draggableId={task.id} index={index} key={task.id}>
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        {...drag.dragHandleProps}
                        data-testid={`kanban-card-${task.id}`}
                        className="mb-2 rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                      >
                        {task.title}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}
