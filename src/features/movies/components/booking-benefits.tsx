import type { bookingBenefits } from "@/features/movies/mocks/booking-benefits";
import { ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = { sparkles: Sparkles, shield: ShieldCheck, scan: ScanLine };

export function BookingBenefits({ benefits }: { benefits: readonly (typeof bookingBenefits)[number][] }) {
  return <section aria-label="A better movie-going experience" className="mt-8 grid gap-5 md:grid-cols-3">
    {benefits.map(({ eyebrow, title, description, icon, iconClass, badgeClass }) => { const Icon = icons[icon]; return <article key={title} className="rounded-xl border border-border/40 bg-card p-6 sm:p-7">
      <div className={cn("mb-5 flex size-11 items-center justify-center rounded-full", iconClass)}><Icon className="size-5" aria-hidden="true" /></div>
      <span className={cn("inline-block rounded px-1.5 py-0.5 text-[10px] font-medium", badgeClass)}>{eyebrow}</span>
      <h2 className="mt-2 text-base font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-sm text-xs leading-6 text-muted-foreground">{description}</p>
    </article>; })}
  </section>;
}
