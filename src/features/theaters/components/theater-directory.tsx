"use client";

import { LoadMoreBatch, useInfiniteBatch } from "@/components/shared/infinite-batch";
import { useState } from "react";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import type { HomeContent } from "@/features/home/services/home-content-service";
import { showtimeSeatsRoute } from "@/lib/constants/routes";

const showTime = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function TheaterDirectory({ content }: { content: HomeContent }) {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const theaters = content.theaters.filter((theater) => (!city || theater.city === city) && `${theater.name} ${theater.location}`.toLowerCase().includes(term));

  const batch = useInfiniteBatch(theaters, JSON.stringify([city, query]));

  return <>
    <header><p className="text-xs font-semibold uppercase tracking-widest text-primary">Your next movie night</p><h1 className="mt-2 text-3xl font-semibold">Explore theaters</h1><p className="mt-3 text-sm text-muted-foreground">Find a theater and choose an upcoming show. All times are in IST.</p></header>
    <div className="my-7 grid gap-4 sm:grid-cols-2">
      <div><label htmlFor="theater-search" className="mb-2 block text-sm font-medium">Search theaters</label><input id="theater-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Theater name or location" className="min-h-11 w-full rounded-lg border bg-card px-3 text-sm focus-visible:outline-ring" /></div>
      <div><label htmlFor="theater-city" className="mb-2 block text-sm font-medium">City</label><select id="theater-city" value={city} onChange={(event) => setCity(event.target.value)} className="min-h-11 w-full rounded-lg border bg-card px-3 text-sm focus-visible:outline-ring"><option value="">All cities</option>{content.cities.map((value) => <option key={value}>{value}</option>)}</select></div>
    </div>
    <p role="status" className="mb-4 text-sm text-muted-foreground">{theaters.length} {theaters.length === 1 ? "theater" : "theaters"} found</p>
    <div className="grid items-start gap-5 lg:grid-cols-2">{batch.items.map((theater) => {
      const shows = content.shows.filter((show) => show.theater.id === theater.id);
      const movies = content.movies.filter((movie) => shows.some((show) => show.movie_id === movie.id));
      return <article key={theater.id} className="min-w-0 overflow-hidden rounded-2xl border bg-card">
        <header className="border-b bg-indigo-50/50 p-5 sm:p-6"><Building2 className="mb-3 size-6 text-primary" aria-hidden="true" /><h2 className="text-lg font-semibold">{theater.name}</h2><p className="mt-2 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{theater.location}</p><p className="mt-3 text-xs text-muted-foreground">{theater.screenCount} screens · {theater.capacity} seats</p></header>
        <div className="divide-y px-5 sm:px-6">{movies.map((movie) => <section key={movie.id} className="py-5" aria-label={`${movie.title} showtimes`}><h3 className="font-semibold">{movie.title}</h3><p className="mt-1 text-xs text-muted-foreground">{movie.language} · {movie.duration_minutes} min</p><div className="mt-3 flex flex-wrap gap-2">{shows.filter((show) => show.movie_id === movie.id).map((show) => <Link key={show.id} href={showtimeSeatsRoute(show.id)} aria-label={`${movie.title}, ${showTime.format(new Date(show.starts_at))} IST, ${show.screen.name}, ${theater.name}`} className="inline-flex min-h-11 max-w-full flex-col justify-center rounded-lg border border-tertiary/30 px-3 py-2 text-xs text-tertiary hover:bg-tertiary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><span className="font-medium">{showTime.format(new Date(show.starts_at))}</span><span className="mt-1 text-[10px]">{show.screen.name}</span></Link>)}</div></section>)}{!movies.length && <p className="py-6 text-sm text-muted-foreground">No upcoming shows scheduled at this theater.</p>}</div>
      </article>;
    })}</div>
    <LoadMoreBatch hasMore={batch.hasMore} loadMore={batch.loadMore} label="theaters" />
    {!theaters.length && <div className="rounded-xl border bg-card p-8 text-center"><h2 className="font-semibold">No theaters found</h2><p className="mt-2 text-sm text-muted-foreground">Try another city or search term.</p></div>}
  </>;
}
