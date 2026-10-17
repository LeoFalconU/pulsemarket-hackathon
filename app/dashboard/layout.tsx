import Link from 'next/link'
import type { ReactNode } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav
        aria-label="Navegación del dashboard"
        className="flex gap-4 border-b border-gray-200 bg-white px-6 py-4"
      >
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/products">Productos</Link>
        <Link href="/dashboard/kanban">Kanban</Link>
      </nav>
      {children}
    </div>
  )
}
