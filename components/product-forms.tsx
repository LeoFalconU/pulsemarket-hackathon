'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { productCategories } from '@/lib/validations/product'

export function ProductCreateForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        category: formData.get('category'),
        price: formData.get('price'),
        stock: formData.get('stock'),
      }),
    })
    setPending(false)
    if (!response.ok) {
      setError('No se pudo crear el producto. Revisa el formulario.')
      return
    }
    router.refresh()
  }

  return (
    <form action={onSubmit} className="grid gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-semibold">Nuevo producto</h2>
      <input
        name="name"
        required
        placeholder="Nombre"
        data-testid="product-name"
        className="h-10 rounded-lg border border-zinc-300 px-3 text-sm"
      />
      <select
        name="category"
        data-testid="product-category"
        className="h-10 rounded-lg border border-zinc-300 px-3 text-sm"
      >
        {productCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <input
        name="price"
        type="number"
        step="0.01"
        min="0.01"
        required
        placeholder="Precio"
        data-testid="product-price"
        className="h-10 rounded-lg border border-zinc-300 px-3 text-sm"
      />
      <input
        name="stock"
        type="number"
        min="0"
        required
        placeholder="Stock"
        data-testid="product-stock"
        className="h-10 rounded-lg border border-zinc-300 px-3 text-sm"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        data-testid="product-create"
        disabled={pending}
        className="h-10 rounded-lg bg-zinc-950 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? 'Guardando...' : 'Crear producto'}
      </button>
    </form>
  )
}

export function BulkPriceForm() {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    const response = await fetch('/api/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: formData.get('category'),
        percent: formData.get('percent'),
      }),
    })
    if (!response.ok) {
      setMessage('No se pudo actualizar el lote.')
      return
    }
    const payload = (await response.json()) as { updated: number }
    setMessage(`Actualizados ${payload.updated} productos.`)
    router.refresh()
  }

  return (
    <form action={onSubmit} className="grid gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-semibold">Bulk update de precios</h2>
      <select name="category" className="h-10 rounded-lg border border-zinc-300 px-3 text-sm">
        {productCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <input
        name="percent"
        type="number"
        min="-50"
        max="50"
        required
        placeholder="% (ej. 10 o -5)"
        className="h-10 rounded-lg border border-zinc-300 px-3 text-sm"
      />
      {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
      <button type="submit" className="h-10 rounded-lg border border-zinc-300 text-sm font-medium">
        Aplicar a la categoría
      </button>
    </form>
  )
}
