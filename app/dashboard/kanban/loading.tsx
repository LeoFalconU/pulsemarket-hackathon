export default function LoadingKanban() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-6xl animate-pulse space-y-6 p-6">
      <div className="h-8 w-64 rounded bg-gray-200" />
      <div className="grid gap-4 md:grid-cols-3">
        {['todo', 'progress', 'done'].map((column) => (
          <div key={column} className="min-h-64 space-y-3 rounded-xl border bg-gray-100 p-3">
            <div className="h-5 w-1/2 rounded bg-gray-200" />
            <div className="h-16 rounded bg-gray-200" />
            <div className="h-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </main>
  )
}