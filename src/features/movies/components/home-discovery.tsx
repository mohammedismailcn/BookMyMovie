"use client";

import { BookingButton } from "@/features/auth/components/booking-button";
import { movieTheatersRoute } from "@/lib/constants/routes";
import Image from "next/image";
import { CuratedScreenings } from "@/features/movies/components/curated-screenings";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreeningFilters } from "@/features/movies/components/screening-filters";
import type { Movie } from "@/features/movies/types/movie-types";
import { cn } from "@/lib/utils";

type ScreeningDate = { value: string; weekday: string; label: string };

export function HomeDiscovery({ movies, featuredMovies, dates, cities, hub, date, query, onCityChange, onDateChange, onQueryChange, onChooseMovie, onFindShows }: {
  movies: readonly Movie[];
  featuredMovies: readonly Movie[];
  dates: readonly ScreeningDate[];
  cities: readonly string[];
  hub: string; date: string; query: string;
  onCityChange(value: string): void; onDateChange(value: string): void; onQueryChange(value: string): void;
  onChooseMovie(movie: Movie): void;
  onFindShows(): void;
}) {
  const [experience, setExperience] = useState(0);
  const featured = featuredMovies[experience % Math.max(featuredMovies.length, 1)];

  function exploreMovie(movie: Movie | undefined = featured) {
    if (!movie) return;
    onChooseMovie(movie);
  }

  return <>
    {featured && <section aria-label="Featured movie" aria-roledescription="carousel" className="relative isolate flex min-h-[420px] items-end overflow-hidden rounded-xl bg-neutral text-white shadow-sm sm:min-h-[520px] lg:min-h-[560px]">
      <Image src={featured.poster_url} alt={`${featured.title} featured artwork`} fill priority sizes="(min-width: 1280px) 1216px, 100vw" className="-z-20 object-cover object-[60%_center] opacity-55" />
      <div className="w-full px-5 pb-20 pt-20 sm:px-10 sm:pb-12 lg:px-12 lg:pb-12">
        <div className="max-w-xl space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide sm:text-[10px]">
            {[featured.language, ...featured.genre.split(", ")].map((badge) => <span key={badge} className="rounded-full bg-white/15 px-2 py-1">{badge}</span>)}
          </div>
          <div><h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{featured.title}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-200">{featured.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-200">
            <span aria-hidden="true" className="px-1 text-slate-400">•</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden="true" />{Math.floor(featured.duration_minutes / 60)}h {featured.duration_minutes % 60}m</span>
            <span aria-hidden="true" className="px-1 text-slate-400">•</span><span>{featured.genre}</span>
          </div>
          <p className="text-[11px] font-medium text-slate-300">{featured.language} · {featured.duration_minutes} minutes</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <BookingButton destination={movieTheatersRoute(featured.id, hub, date)} className="h-12 rounded-full bg-primary px-6 text-white hover:bg-primary/85"><Ticket aria-hidden="true" />Book Tickets</BookingButton>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-5 flex items-center gap-3 sm:bottom-6 sm:right-8" aria-label="Featured experience controls">
        <Button size="icon" onClick={() => setExperience((experience + featuredMovies.length - 1) % featuredMovies.length)} aria-label="Previous featured experience" className="rounded-full bg-white/15 text-white hover:bg-white/25"><ArrowLeft aria-hidden="true" /></Button>
        <div className="flex gap-1.5">{featuredMovies.map(({ title: label }, index) => <button key={label} type="button" aria-label={label} aria-pressed={experience === index} onClick={() => setExperience(index)} className="flex h-11 items-center px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><span className={cn("h-1.5 rounded-full bg-white/35 transition-all", experience === index ? "w-6 bg-primary" : "w-1.5")} /></button>)}</div>
        <Button size="icon" onClick={() => setExperience((experience + 1) % featuredMovies.length)} aria-label="Next featured experience" className="rounded-full bg-white/15 text-white hover:bg-white/25"><ArrowRight aria-hidden="true" /></Button>
      </div>
    </section>}

    <ScreeningFilters cities={cities} dates={dates} city={hub} date={date} query={query} onCityChange={onCityChange} onDateChange={onDateChange} onQueryChange={onQueryChange} onSubmit={onFindShows} />

    <CuratedScreenings movies={movies} onChooseMovie={exploreMovie} city={hub} date={date} horizontal />

  </>;
}
