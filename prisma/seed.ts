import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = ['Electrónica', 'Ropa', 'Hogar', 'Juguetes', 'Deportes'] as const
const KANBAN_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const

async function main() {
  console.log('Iniciando seed correlacionado (clientes, productos, ventas)...')

  await prisma.sale.deleteMany()
  await prisma.kanbanTask.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()

  const customers = Array.from({ length: 250 }, (_, i) => ({
    name: `Cliente ${i + 1}`,
    email: `cliente${i + 1}@pulsemarket.test`,
  }))
  await prisma.customer.createMany({ data: customers })
  const savedCustomers = await prisma.customer.findMany({ select: { id: true } })

  const totalProducts = 10000
  const chunkSize = 2000

  for (let i = 0; i < totalProducts; i += chunkSize) {
    const chunk = Array.from({ length: chunkSize }, (_, index) => {
      const n = i + index
      return {
        name: `Producto ${n + 1}`,
        category: CATEGORIES[n % CATEGORIES.length],
        price: new Prisma.Decimal(((n % 500) + 1) * 1.25),
        stock: (n % 80) + 1,
      }
    })
    await prisma.product.createMany({ data: chunk })
    console.log(`Productos inyectados: ${Math.min(i + chunkSize, totalProducts)}`)
  }

  const savedProducts = await prisma.product.findMany({
    select: { id: true, price: true },
  })

  const totalSales = 4000
  const saleChunk = 1000
  for (let i = 0; i < totalSales; i += saleChunk) {
    const chunk = Array.from({ length: saleChunk }, (_, index) => {
      const n = i + index
      const product = savedProducts[n % savedProducts.length]
      const customer = savedCustomers[n % savedCustomers.length]
      const quantity = (n % 5) + 1
      return {
        quantity,
        total: product.price.mul(quantity),
        status: n % 17 === 0 ? 'PENDING' : 'COMPLETED',
        productId: product.id,
        customerId: customer.id,
      }
    })
    await prisma.sale.createMany({ data: chunk })
    console.log(`Ventas inyectadas: ${Math.min(i + saleChunk, totalSales)}`)
  }

  await prisma.kanbanTask.createMany({
    data: [
      { title: 'Revisar inventario Electrónica', status: KANBAN_STATUSES[0], position: 0 },
      { title: 'Actualizar precios Ropa', status: KANBAN_STATUSES[0], position: 1 },
      { title: 'Validar cupones de temporada', status: KANBAN_STATUSES[0], position: 2 },
      { title: 'Preparar orden #1042', status: KANBAN_STATUSES[1], position: 0 },
      { title: 'Reponer stock Hogar', status: KANBAN_STATUSES[1], position: 1 },
      { title: 'Cerrar lote de ventas', status: KANBAN_STATUSES[2], position: 0 },
      { title: 'Auditoría de bajas (soft delete)', status: KANBAN_STATUSES[2], position: 1 },
    ],
  })

  const [customerCount, productCount, saleCount] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.sale.count(),
  ])

  console.log(
    `Seed OK: ${customerCount} clientes, ${productCount} productos, ${saleCount} ventas (total ${customerCount + productCount + saleCount})`,
  )
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
