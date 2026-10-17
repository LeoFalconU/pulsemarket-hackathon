import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/session'
import { kanbanMoveSchema } from '@/lib/validations/kanban'

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

export async function PATCH(request: Request) {
  const session = await getAuthSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = kanbanMoveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const task = await prisma.kanbanTask.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      position: parsed.data.position,
    },
  })

  return NextResponse.json({ task })
}
