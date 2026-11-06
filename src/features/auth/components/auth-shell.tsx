export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="flex flex-1 items-start justify-center bg-muted/40 px-4 py-6 sm:px-5 sm:py-16">
    <section className="w-full max-w-md min-w-0 space-y-5 rounded-2xl border bg-card p-4 sm:space-y-6 shadow-sm sm:p-8">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">BookMyMovie · Demo account</p><h1 className="text-2xl font-semibold">{title}</h1></div>
      <p className="rounded-lg bg-secondary/20 p-3 text-xs leading-5">Demo only. Accounts stay in this browser. Use a sample password, never a real one. This is not secure authentication.</p>
      {children}
    </section>
  </main>;
}
