"use client";
import { useState } from "react";
import { ArrowRight, CreditCard, Gift, Sandwich } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { homeOffers } from "@/features/payments/mocks/home-offers";
import { cn } from "@/lib/utils";
export function HomeOffers({ offers }: { offers: readonly (typeof homeOffers)[number][] }) {
  const [message, setMessage] = useState("");
  const [terms, setTerms] = useState(false);
  async function copy(code: string) {
    try { await navigator.clipboard.writeText(code); setMessage(`Copied ${code}. This is a demo code; no discount has been applied.`); }
    catch { setMessage(`Demo code: ${code}. Clipboard access is unavailable; copy it manually. No discount has been applied.`); }
  }
  return <section aria-labelledby="offers-heading" className="mt-12 sm:mt-16"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary"><Gift className="size-3" aria-hidden="true" />Member privileges</p><h2 id="offers-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Exclusive Offers & Bank Promos</h2></div><Button variant="link" className="px-0 text-xs" aria-expanded={terms} aria-controls="offer-details" onClick={() => setTerms(!terms)}>View All {offers.length} Sample Offers<ArrowRight aria-hidden="true" /></Button></div>
    {!offers.length && <p className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">No sample offers are currently active.</p>}
    <div className="grid gap-5 lg:grid-cols-2">{offers.map((offer) => <article key={offer.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-xl border border-border/40 bg-card p-5 sm:flex sm:p-6"><div className={cn("flex size-14 shrink-0 items-center justify-center rounded-xl", offer.type === "bank" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary")}>{offer.type === "bank" ? <CreditCard aria-hidden="true" className="size-6" /> : <Sandwich aria-hidden="true" className="size-6" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2 text-[9px]"><span className={cn("rounded px-1.5 py-0.5 font-semibold uppercase", offer.type === "bank" ? "bg-secondary/25 text-yellow-800" : "bg-tertiary/10 text-green-800")}>{offer.badge}</span><span className="text-muted-foreground">{offer.expiry}</span></div><h3 className="mt-2 text-sm font-semibold">{offer.title}</h3><p className="mt-1 text-[10px] leading-5 text-muted-foreground">{offer.description}</p></div><Button variant="secondary" onClick={() => { void copy(offer.code); }} className="col-span-2 justify-self-start rounded-full bg-indigo-50 text-[10px] sm:shrink-0">Copy: {offer.code}</Button></article>)}</div>
    {terms && <p id="offer-details" className="mt-4 rounded-lg border bg-card p-4 text-xs leading-6">Demo promotions only. These codes cannot be redeemed; eligibility, bank verification, expiry, and payment discounts are not connected.</p>}{message && <p role="status" className="mt-3 text-xs text-muted-foreground">{message}</p>}
  </section>;
}
