export function KanbanSkeleton() {
  return <main aria-label="Cargando Kanban" className="mx-auto w-full max-w-7xl animate-pulse space-y-6 p-5 md:p-8"><div className="h-3 w-32 rounded bg-zinc-200"/><div className="h-9 w-64 rounded bg-zinc-200"/><div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <div key={i} className="min-h-72 rounded-2xl border bg-zinc-50 p-4"><div className="h-5 w-28 rounded bg-zinc-200"/><div className="mt-5 space-y-3">{Array.from({ length: 3 }, (_, j) => <div key={j} className="h-20 rounded-xl border bg-white"/>)}</div></div>)}</div></main>
}
