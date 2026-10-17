export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="h-12 bg-zinc-100 dark:bg-zinc-900" />
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-11 border-t border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
        />
      ))}
    </div>
  )
}
