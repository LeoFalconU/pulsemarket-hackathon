export function DashboardSkeleton() {
  return <main aria-label="Cargando dashboard" className="mx-auto flex w-full max-w-7xl animate-pulse flex-col gap-8 p-5 md:p-8">
    <div className="space-y-3"><div className="h-3 w-40 rounded bg-zinc-200"/><div className="h-9 w-72 rounded bg-zinc-200"/><div className="h-4 w-96 max-w-full rounded bg-zinc-100"/></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 rounded-2xl border p-5"><div className="h-3 w-24 rounded bg-zinc-200"/><div className="mt-4 h-7 w-32 rounded bg-zinc-200"/><div className="mt-3 h-3 w-28 rounded bg-zinc-100"/></div>)}</div>
    <div className="grid gap-5 lg:grid-cols-2"><div className="h-72 rounded-2xl border bg-zinc-50"/><div className="h-72 rounded-2xl border bg-zinc-50"/></div><div className="h-64 rounded-2xl border bg-zinc-50"/>
  </main>
}
