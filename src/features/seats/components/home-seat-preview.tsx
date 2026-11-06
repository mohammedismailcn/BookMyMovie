"use client";
import { useState } from "react";
import { BadgeCheck, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PreviewSeat } from "@/features/home/services/home-content-service";
import { cn } from "@/lib/utils";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export function HomeSeatPreview({ seats: previewSeats, title, startsAt }: { seats: readonly PreviewSeat[]; title: string; startsAt: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const rows = [...new Set(previewSeats.map((seat) => seat.row))];
  const labels = selected.map((id) => previewSeats.find((seat) => seat.id === id)?.label ?? id);
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState("");
  const total = previewSeats.filter((seat) => selected.includes(seat.id)).reduce((sum, seat) => sum + seat.price, 0);
  function toggle(id: string) {
    setReview(false);
    if (!selected.includes(id) && selected.length >= 6) { setMessage("Choose up to 6 seats in this preview."); return; }
    setMessage("");
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }
  return <section aria-labelledby="seat-preview-heading" className="mt-12 rounded-xl border border-border/50 bg-card p-5 shadow-sm sm:mt-16 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-tertiary"><Layers3 aria-hidden="true" className="size-3.5" />Interactive spatial preview</p><h2 id="seat-preview-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">Live Seat Map Experience</h2><p className="mt-1 text-xs text-muted-foreground">{title} · {new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(startsAt))} IST. Mock inventory; selections do not reserve seats.</p></div>
      <ul aria-label="Seat legend" className="flex flex-wrap gap-3 text-[10px] font-medium">{[{ label: "Available", style: "border bg-indigo-50" }, { label: "Selected", style: "bg-primary" }, { label: "Premium / recliner", style: "bg-secondary" }, { label: "Reserved", style: "bg-indigo-200" }].map((item) => <li key={item.label} className="flex items-center gap-1.5"><span aria-hidden="true" className={cn("size-3 rounded-sm", item.style)} />{item.label}</li>)}</ul>
    </div>
    <div className="mx-auto mt-7 max-w-xl"><div className="mx-auto h-3 w-11/12 rounded-t-[100%] border-t-[3px] border-primary/15 bg-gradient-to-b from-primary/5 to-transparent" /><div className="mx-auto h-px w-3/4 bg-indigo-200" /><p className="mt-2 text-center text-[9px] font-medium uppercase tracking-widest text-muted-foreground">Screen this way</p></div>
    <div className="mx-auto my-7 flex max-w-full w-fit overflow-x-auto pb-2 flex-col gap-2" role="group" aria-label="Demo auditorium seats">
      {rows.map((row) => <div key={row} className="flex w-max items-center gap-0.5 min-[375px]:gap-1.5"><span className="w-2 min-[375px]:w-3 text-[10px] text-muted-foreground" aria-hidden="true">{row}</span>{previewSeats.filter((seat) => seat.row === row).map((seat) => <button key={seat.id} type="button" disabled={seat.reserved} aria-pressed={selected.includes(seat.id)} aria-label={`Seat ${seat.label}, ${seat.reserved ? seat.status.toLowerCase() : seat.type.toLowerCase()}, ${money.format(seat.price)}`} onClick={() => toggle(seat.id)} className={cn("flex size-6 items-center justify-center rounded text-[9px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring min-[375px]:size-7 sm:size-8", selected.includes(seat.id) ? "bg-primary text-white ring-1 ring-primary ring-offset-1" : seat.reserved ? "cursor-not-allowed bg-indigo-100 text-slate-400 line-through" : seat.vip ? "bg-secondary text-neutral hover:bg-secondary/70" : "bg-indigo-50 text-neutral hover:bg-indigo-100")}>{seat.label}</button>)}</div>)}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-indigo-50 p-4"><div className="flex items-start gap-2"><BadgeCheck className="mt-0.5 size-5 shrink-0 text-tertiary" aria-hidden="true" /><div><p className="text-xs font-semibold">{selected.length ? `Your experience pick (${labels.join(", ")})` : "Choose your seats"}</p><p className="mt-1 text-[10px] text-muted-foreground">Try a central view or discover a little more space.</p></div></div><div className="flex flex-wrap items-center gap-3"><div className="text-right" aria-live="polite"><p className="text-[10px] text-muted-foreground">Sample total · {selected.length} tickets</p><p className="font-semibold text-primary">{money.format(total)}</p></div><Button disabled={!selected.length} onClick={() => setReview(!review)} className="h-10 text-xs text-white">{review ? "Close Summary" : "Quick Checkout"}</Button></div></div>
    {message && <p role="alert" className="mt-3 text-xs">{message}</p>}
    {review && <div role="status" className="mt-3 rounded-lg border border-dashed p-4 text-sm"><strong>Demo selection summary</strong><p className="mt-1">{labels.join(", ")} · {money.format(total)}. No reservation or payment has been created.</p></div>}
  </section>;
}
