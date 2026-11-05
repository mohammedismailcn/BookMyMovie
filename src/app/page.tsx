import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-24">
      <section className="w-full max-w-lg space-y-6 rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Your next project starts here</p>
        <h1 className="text-4xl font-bold tracking-tight">BookMyMovie</h1>
        <p className="text-muted-foreground">Next.js, Tailwind CSS, and shadcn/ui are ready. Edit src/app/page.tsx to get started.</p>
        <Button render={<a href="https://ui.shadcn.com/docs" target="_blank" rel="noreferrer" />}>Explore UI components</Button>
      </section>
    </main>
  );
}
