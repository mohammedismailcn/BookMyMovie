"use client";

import { LoadMoreBatch, useInfiniteBatch } from "@/components/shared/infinite-batch";
import Link from "next/link";
import { Armchair, ArrowRight, Building2 } from "lucide-react";
import type { HomeContent, HomeShow } from "@/features/home/services/home-content-service";
import { Button } from "@/components/ui/button";
import { moviesRoute } from "@/lib/constants/routes";

export function HomeTheaters({ theaters, shows, city, date }: {
  theaters: HomeContent["theaters"]; shows: readonly HomeShow[]; city: string; date: string;
}) {
  const batch = useInfiniteBatch(theaters, JSON.stringify([city, date]));
  return <section aria-labelledby="nearby-theaters-heading" className="mt-12 sm:mt-16">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary"><Building2 className="size-3" aria-hidden="true" />Theaters</p><h2 id="nearby-theaters-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Theaters in {city}</h2></div><Button nativeButton={false} render={<Link href={moviesRoute(city,date)} />} variant="link" className="px-0 text-xs">Explore movies in {city}<ArrowRight aria-hidden="true" /></Button></div>
    {!theaters.length && <p className="rounded-xl border bg-card p-5 text-sm">No theaters are available in this city.</p>}
    <div className="grid items-start gap-5 md:grid-cols-3">{batch.items.map((theater)=>{
      const count=shows.filter((show)=>show.theater.id===theater.id).length;
      return <article key={theater.id} className="rounded-xl border border-border/40 bg-card p-5 sm:p-6"><div className="flex items-start justify-between gap-2"><h3 className="text-base font-semibold">{theater.name}</h3><span className="shrink-0 rounded bg-indigo-50 px-1.5 py-1 text-[9px]">{theater.screenCount} screens</span></div><p className="mt-1 text-[11px] text-muted-foreground">{theater.location}</p><p className="my-5 flex items-center gap-1.5 text-[10px] text-muted-foreground"><Armchair className="size-3 text-tertiary" aria-hidden="true" />{theater.capacity} physical seats across the venue</p><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-primary">{count} matching shows</span><Button nativeButton={false} render={<Link href={moviesRoute(city,date,theater.name)} />} variant="secondary" className="rounded-full bg-indigo-50 text-[10px]" aria-label={`View shows at ${theater.name}`}>View Shows<ArrowRight aria-hidden="true" /></Button></div></article>;
    })}</div>
    <LoadMoreBatch hasMore={batch.hasMore} loadMore={batch.loadMore} label="theaters" />
  </section>;
}
