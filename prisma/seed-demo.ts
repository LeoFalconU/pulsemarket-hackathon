import { Prisma, PrismaClient } from '@prisma/client'

const CONFIRMATION = 'INSERT_DEMO_DATA_NON_DESTRUCTIVELY'
const totalProducts = 10_000
const totalCustomers = 250
const totalSales = 4_000
const productPrefix = 'demo_product_'
const customerPrefix = 'demo_customer_'
const salePrefix = 'demo_sale_'

const categories = ['Electrónica', 'Ropa', 'Hogar', 'Juguetes', 'Deportes'] as const
const statuses = ['TODO', 'IN_PROGRESS', 'DONE'] as const

function getDemoDatabaseUrl(): string {
  const databaseUrl = process.env.PULSEMARKET_DEMO_DATABASE_URL
  if (!databaseUrl) {
    throw new Error(
      'Define PULSEMARKET_DEMO_DATABASE_URL con la URL de una base PostgreSQL aislada.',
    )
  }
  if (process.env.PULSEMARKET_DEMO_SEED_CONFIRM !== CONFIRMATION) {
    throw new Error(
      `Confirma la inserción no destructiva definiendo PULSEMARKET_DEMO_SEED_CONFIRM=${CONFIRMATION}.`,
    )
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(databaseUrl)
  } catch {
    throw new Error('PULSEMARKET_DEMO_DATABASE_URL no es una URL válida.')
  }

  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
    throw new Error('El seed de demo solo acepta una URL PostgreSQL.')
  }
  if (['localhost', '127.0.0.1', '[::1]'].includes(parsedUrl.hostname)) {
    throw new Error(
      'Este comando es solo para una base de demo remota. Usa prisma:seed para la base local.',
    )
  }

  return databaseUrl
}

async function seedDemo() {
  const databaseUrl = getDemoDatabaseUrl()
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })
  const now = new Date()

  try {
    console.log(
      'Insertando datos de demo de forma aditiva. No se borrará ni reemplazará ningún registro.',
    )

    await prisma.customer.createMany({
      data: Array.from({ length: totalCustomers }, (_, index) => {
        const number = index + 1
        return {
          id: `${customerPrefix}${String(number).padStart(4, '0')}`,
          name: `Cliente demo ${number}`,
          email: `cliente${number}@pulsemarket-demo.test`,
        }
      }),
      skipDuplicates: true,
    })

    for (let offset = 0; offset < totalProducts; offset += 1_000) {
      const count = Math.min(1_000, totalProducts - offset)
      const products = Array.from({ length: count }, (_, index) => {
        const number = offset + index + 1
        return {
          id: `${productPrefix}${String(number).padStart(5, '0')}`,
          name: `Producto demo ${String(number).padStart(5, '0')}`,
          category: categories[(number - 1) % categories.length],
          price: new Prisma.Decimal(((number % 500) + 1) * 1.25),
          stock: (number % 80) + 1,
          createdAt: new Date(now.getTime() - (number % 60) * 24 * 60 * 60 * 1_000),
          updatedAt: now,
        }
      })
      await prisma.product.createMany({ data: products, skipDuplicates: true })
      console.log(`Productos demo procesados: ${offset + count}/${totalProducts}`)
    }

    const [customers, products] = await Promise.all([
      prisma.customer.findMany({
        where: { id: { startsWith: customerPrefix } },
        orderBy: { id: 'asc' },
        select: { id: true },
      }),
      prisma.product.findMany({
        where: { id: { startsWith: productPrefix } },
        orderBy: { id: 'asc' },
        select: { id: true, price: true },
      }),
    ])
    if (customers.length !== totalCustomers || products.length !== totalProducts) {
      throw new Error('No se encontraron todas las filas demo necesarias para crear ventas.')
    }

    for (let offset = 0; offset < totalSales; offset += 1_000) {
      const count = Math.min(1_000, totalSales - offset)
      const sales = Array.from({ length: count }, (_, index) => {
        const number = offset + index + 1
        const product = products[(number - 1) % products.length]
        const customer = customers[(number - 1) % customers.length]
        const quantity = (number % 5) + 1
        return {
          id: `${salePrefix}${String(number).padStart(5, '0')}`,
          quantity,
          total: product.price.mul(quantity),
          status: number % 17 === 0 ? 'PENDING' : 'COMPLETED',
          productId: product.id,
          customerId: customer.id,
          createdAt: new Date(now.getTime() - (number % 30) * 24 * 60 * 60 * 1_000),
        }
      })
      await prisma.sale.createMany({ data: sales, skipDuplicates: true })
      console.log(`Ventas demo procesadas: ${offset + count}/${totalSales}`)
    }

    await prisma.kanbanTask.createMany({
      data: [
        { id: 'demo_kanban_task_01', title: 'Revisar inventario Electrónica', status: statuses[0], position: 0 },
        { id: 'demo_kanban_task_02', title: 'Actualizar precios Ropa', status: statuses[0], position: 1 },
        { id: 'demo_kanban_task_03', title: 'Validar cupones de temporada', status: statuses[0], position: 2 },
        { id: 'demo_kanban_task_04', title: 'Preparar orden demo #1042', status: statuses[1], position: 0 },
        { id: 'demo_kanban_task_05', title: 'Reponer stock Hogar', status: statuses[1], position: 1 },
        { id: 'demo_kanban_task_06', title: 'Cerrar lote de ventas demo', status: statuses[2], position: 0 },
        { id: 'demo_kanban_task_07', title: 'Revisar bajas de catálogo', status: statuses[2], position: 1 },
      ],
      skipDuplicates: true,
    })

    const [demoCustomerCount, demoProductCount, demoSaleCount, demoTaskCount] =
      await Promise.all([
        prisma.customer.count({ where: { id: { startsWith: customerPrefix } } }),
        prisma.product.count({ where: { id: { startsWith: productPrefix } } }),
        prisma.sale.count({ where: { id: { startsWith: salePrefix } } }),
        prisma.kanbanTask.count({ where: { id: { startsWith: 'demo_kanban_task_' } } }),
      ])

    console.log(
      `Seed demo listo: ${demoCustomerCount} clientes, ${demoProductCount} productos, ${demoSaleCount} ventas y ${demoTaskCount} tareas. Total: ${demoCustomerCount + demoProductCount + demoSaleCount + demoTaskCount}.`,
    )
  } finally {
    await prisma.$disconnect()
  }
}

seedDemo().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
