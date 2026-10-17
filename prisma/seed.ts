import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando inyección de 10,000 registros...')

  // Limpiar base de datos
  await prisma.sale.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()

  // 1. Crear 100 Clientes
  const customers = Array.from({ length: 100 }).map((_, i) => ({
    name: `Cliente ${i}`,
    email: `cliente${i}@empresa.com`,
  }))
  await prisma.customer.createMany({ data: customers })
  const savedCustomers = await prisma.customer.findMany()

  // 2. Crear 10,000 Productos divididos en bloques (Chunks) para no ahogar la RAM
  const categories = ['Electrónica', 'Ropa', 'Hogar', 'Juguetes', 'Deportes']
  const totalProducts = 10000
  const chunkSize = 2000

  for (let i = 0; i < totalProducts; i += chunkSize) {
    const chunk = Array.from({ length: chunkSize }).map((_, index) => ({
      name: `Producto ${i + index}`,
      category: categories[(i + index) % categories.length],
      price: Number((Math.random() * 1000).toFixed(2)),
      stock: Math.floor(Math.random() * 100),
    }))
    await prisma.product.createMany({ data: chunk })
    console.log(`Inyectados ${i + chunkSize} productos...`)
  }

  console.log('¡Seed completado con éxito!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.\$disconnect()
  })