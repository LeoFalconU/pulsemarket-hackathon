import Link from 'next/link'
import type { ReactNode } from 'react'
import { SignOutButton } from '@/components/sign-out-button'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 md:flex">
      <aside className="border-b border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex md:w-64 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-4 p-4 md:block md:border-b md:border-gray-200 md:px-6 md:py-5 dark:md:border-zinc-800">
          <Link href="/dashboard" className="text-lg font-bold">
            PulseMarket
          </Link>
          <div className="md:hidden">
            <SignOutButton />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 p-3 md:flex-1 md:flex-col md:items-stretch md:justify-start md:gap-0 md:px-4 md:py-4">
          <nav
            aria-label="Navegación del dashboard"
            className="flex flex-wrap gap-1 md:flex-col"
          >
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/products"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              Productos
            </Link>
            <Link
              href="/dashboard/kanban"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              Kanban
            </Link>
          </nav>

          <div className="hidden border-t border-gray-200 pt-4 md:mt-auto md:block dark:border-zinc-800">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-auto p-4 md:p-8">{children}</div>
    </div>
  )
}
