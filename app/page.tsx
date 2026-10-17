import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-4xl font-semibold tracking-tight">PulseMarket</h1>
      <p className="max-w-lg text-center text-zinc-600 dark:text-zinc-400">
        Dashboard de analítica y gestión e-commerce. Acceso únicamente con Google o GitHub.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium"
        >
          Ir al dashboard
        </Link>
      </div>
    </main>
  )
}
