import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/session'
import {
  kanbanCreateSchema,
  kanbanDeleteSchema,
  kanbanMoveSchema,
  kanbanStatuses,
  kanbanUpdateSchema,
} from '@/lib/validations/kanban'

const MAX_TASKS = 100

async function readBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export async function GET() {
  const session = await getAuthSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const tasks = await prisma.kanbanTask.findMany({
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
    take: 100,
  })
  return NextResponse.json({ tasks })
}

export async function POST(request: Request) {
  const session = await getAuthSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const parsed = kanbanCreateSchema.safeParse(await readBody(request))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const task = await prisma.$transaction(async (transaction) => {
    const count = await transaction.kanbanTask.count()
    if (count >= MAX_TASKS) {
      return null
    }

    const latestTask = await transaction.kanbanTask.findFirst({
      where: { status: 'TODO' },
      orderBy: { position: 'desc' },
      select: { position: true },
    })
    return transaction.kanbanTask.create({
      data: {
        title: parsed.data.title,
        status: 'TODO',
        position: (latestTask?.position ?? -1) + 1,
      },
    })
  })

  if (!task) {
    return NextResponse.json(
      { error: `El tablero admite hasta ${MAX_TASKS} tarjetas.` },
      { status: 409 },
    )
  }

  return NextResponse.json({ task }, { status: 201 })
}

export async function PATCH(request: Request) {
  const session = await getAuthSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await readBody(request)
  const update = kanbanUpdateSchema.safeParse(body)
  if (update.success) {
    const existing = await prisma.kanbanTask.findUnique({
      where: { id: update.data.id },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'No se encontró la tarjeta.' }, { status: 404 })
    }

    const task = await prisma.kanbanTask.update({
      where: { id: update.data.id },
      data: { title: update.data.title },
    })
    return NextResponse.json({ task })
  }

  const move = kanbanMoveSchema.safeParse(body)
  if (!move.success) {
    return NextResponse.json(
      { error: update.error.flatten(), moveError: move.error.flatten() },
      { status: 400 },
    )
  }

  const task = await prisma.$transaction(async (transaction) => {
    const tasks = await transaction.kanbanTask.findMany({
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { id: 'asc' }],
      take: MAX_TASKS,
    })
    const movedTask = tasks.find((candidate) => candidate.id === move.data.id)
    if (!movedTask) {
      return null
    }

    const sourceStatus = kanbanStatuses.find((status) => status === movedTask.status)
    if (!sourceStatus) {
      return null
    }
    const affectedStatuses: Array<(typeof kanbanStatuses)[number]> =
      sourceStatus === move.data.status ? [sourceStatus] : [sourceStatus, move.data.status]
    const columns = new Map(
      kanbanStatuses.map((status) => [
        status,
        tasks
          .filter((candidate) => candidate.status === status && candidate.id !== movedTask.id)
          .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id)),
      ]),
    )
    const destination = columns.get(move.data.status)
    if (!destination) {
      return null
    }
    destination.splice(
      Math.min(move.data.position, destination.length),
      0,
      { ...movedTask, status: move.data.status },
    )

    const updates = affectedStatuses.flatMap((status) =>
      (columns.get(status) ?? []).map((candidate, position) =>
        transaction.kanbanTask.update({
          where: { id: candidate.id },
          data: { status, position },
        }),
      ),
    )
    await Promise.all(updates)

    return transaction.kanbanTask.findUnique({ where: { id: movedTask.id } })
  })

  if (!task) {
    return NextResponse.json({ error: 'No se encontró la tarjeta.' }, { status: 404 })
  }

  return NextResponse.json({ task })
}

export async function DELETE(request: Request) {
  const session = await getAuthSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const parsed = kanbanDeleteSchema.safeParse(await readBody(request))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const task = await prisma.kanbanTask.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, status: true },
  })
  if (!task) {
    return NextResponse.json({ error: 'No se encontró la tarjeta.' }, { status: 404 })
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.kanbanTask.delete({ where: { id: task.id } })
    const remainingTasks = await transaction.kanbanTask.findMany({
      where: { status: task.status },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
      take: MAX_TASKS,
    })
    await Promise.all(
      remainingTasks.map((remainingTask, position) =>
        transaction.kanbanTask.update({
          where: { id: remainingTask.id },
          data: { position },
        }),
      ),
    )
  })

  return NextResponse.json({ id: task.id })
}
