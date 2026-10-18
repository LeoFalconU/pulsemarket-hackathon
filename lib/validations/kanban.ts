import { z } from 'zod'

export const kanbanStatuses = ['TODO', 'IN_PROGRESS', 'DONE'] as const

export const kanbanMoveSchema = z.object({
  id: z.string().min(1),
  status: z.enum(kanbanStatuses),
  position: z.coerce.number().int().min(0),
})

export const kanbanCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
})

export const kanbanUpdateSchema = kanbanCreateSchema.extend({
  id: z.string().min(1),
})

export const kanbanDeleteSchema = z.object({
  id: z.string().min(1),
})

export type KanbanMoveInput = z.infer<typeof kanbanMoveSchema>
