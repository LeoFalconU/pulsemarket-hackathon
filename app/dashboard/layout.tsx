import Link from 'next/link'
import { ReactNode } from 'react'
import { SignOutButton } from '@/components/sign-out-button'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Sidebar de Navegación */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold">PulseMarket</h2>
          </div>
          
          <nav className="flex-1 space-y-1 px-4 py-4">
            <Link 
              href="/dashboard" 
              className="flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/kanban" 
              className="flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              Kanban
            </Link>
            <Link 
              href="/dashboard/products" 
              className="flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              Productos
            </Link>
          </nav>
          
          {/* Botón de Cerrar Sesión al final del Sidebar */}
          <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
             <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}