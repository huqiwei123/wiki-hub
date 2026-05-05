export default function BlogPostLoading() {
  const lineWidths = [92, 84, 76, 88, 71, 95, 80, 68];

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-pulse">
      <div className="glass-panel rounded-3xl">
        <div className="min-h-72 p-6 sm:p-8 lg:p-10">
          <div className="h-6 w-24 rounded-lg bg-muted" />
          <div className="mt-8 h-12 w-3/4 rounded-lg bg-muted" />
          <div className="mt-5 h-5 w-2/3 rounded-lg bg-muted" />
        </div>
        <div className="border-t border-border/50 px-6 py-4 sm:px-8 lg:px-10">
          <div className="flex gap-4">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="glass-panel rounded-3xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="space-y-3">
          {lineWidths.map((width, i) => (
            <div key={i} className="h-4 rounded bg-muted" style={{ width: `${width}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
