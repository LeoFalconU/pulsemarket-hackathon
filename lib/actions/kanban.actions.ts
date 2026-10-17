'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { kanbanMoveSchema } from '@/lib/validations/kanban'
import { getAuthSession } from '@/lib/session'

export async function moveKanbanTask(input: unknown) {
  const session = await getAuthSession()
  if (!session) return { ok: false as const, error: 'No autorizado' }
  const parsed = kanbanMoveSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: 'Los datos del movimiento no son válidos' }
  try {
    const task = await prisma.kanbanTask.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status, position: parsed.data.position } })
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/kanban')
    return { ok: true as const, task }
  } catch {
    return { ok: false as const, error: 'No fue posible guardar el cambio' }
  }
}
