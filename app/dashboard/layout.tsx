import Link from 'next/link'
import type { ReactNode } from 'react'
import { SignOutButton } from '@/components/sign-out-button'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 md:flex">
      <aside className="border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/85 md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-4 p-4 md:border-b md:border-zinc-200/80 md:px-6 md:py-5 dark:md:border-zinc-800">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-black text-white shadow-lg shadow-indigo-600/20 transition group-hover:-rotate-3 group-hover:scale-105">
              P
            </span>
            <span>
              <span className="block text-sm font-bold tracking-tight">PulseMarket</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                Commerce analytics
              </span>
            </span>
          </Link>
          <div className="md:hidden">
            <SignOutButton />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 p-3 md:flex-1 md:flex-col md:items-stretch md:justify-start md:gap-0 md:px-4 md:py-5">
          <nav
            aria-label="Navegación del dashboard"
            className="flex flex-wrap gap-1 md:flex-col md:gap-2"
          >
            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition duration-200 hover:translate-x-0.5 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
            >
              <span className="mr-3 text-indigo-500">◫</span>Dashboard
            </Link>
            <Link
              href="/dashboard/products"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition duration-200 hover:translate-x-0.5 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
            >
              <span className="mr-3 text-indigo-500">▦</span>Productos
            </Link>
            <Link
              href="/dashboard/kanban"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition duration-200 hover:translate-x-0.5 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
            >
              <span className="mr-3 text-indigo-500">▤</span>Kanban
            </Link>
          </nav>

          <div className="hidden border-t border-zinc-200 pt-4 md:mt-auto md:block dark:border-zinc-800">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/70 via-zinc-50 to-zinc-50 dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950">
        <div className="motion-rise p-4 md:p-8">{children}</div>
      </div>
    </div>
  )
}
