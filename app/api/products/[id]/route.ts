import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/session'

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAuthSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await context.params
  const product = await prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  })

  return NextResponse.json({ id: product.id, isDeleted: product.isDeleted })
}
