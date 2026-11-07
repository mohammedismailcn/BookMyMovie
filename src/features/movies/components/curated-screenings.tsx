"use client";
import { LoadMoreBatch, useInfiniteBatch } from "@/components/shared/infinite-batch";
import { BookingButton } from "@/features/auth/components/booking-button";
import { movieTheatersRoute } from "@/lib/constants/routes";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/features/movies/types/movie-types";
import { MoviePoster } from "@/features/movies/components/movie-poster";

export function CuratedScreenings({ movies, onChooseMovie, horizontal = false, city, date }: {
  movies: readonly Movie[]; horizontal?: boolean; city?: string; date?: string;
  onChooseMovie: (movie: Movie) => void;
}) {
  const list = useRef<HTMLUListElement>(null);
  const screenings = movies.filter((movie) => movie.is_active);

  const batch = useInfiniteBatch(screenings, JSON.stringify([city, date]));

  return <section aria-labelledby="curated-screenings-heading" className="mt-12 sm:mt-16">
    <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary"><span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />Now showing in theaters</p>
        <h2 id="curated-screenings-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Now Showing</h2>
      </div>
      {horizontal && <div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Scroll movies left" onClick={()=>list.current?.scrollBy({left:-list.current.clientWidth*0.8,behavior:"smooth"})}><ArrowLeft aria-hidden="true" /></Button><Button variant="outline" size="icon" aria-label="Scroll movies right" onClick={()=>list.current?.scrollBy({left:list.current.clientWidth*0.8,behavior:"smooth"})}><ArrowRight aria-hidden="true" /></Button></div>}
    </div>
    <p role="status" className="sr-only">{batch.items.length} of {screenings.length} movies shown.</p>
    {!screenings.length && <p className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">No movies match this date and search.</p>}
    <ul ref={list} aria-label="Movies" tabIndex={horizontal ? 0 : undefined} className={cn("gap-3 sm:gap-5",horizontal ? "flex snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-ring" : "grid grid-cols-2 items-start sm:grid-cols-3 lg:grid-cols-5")}>
      {batch.items.map((movie) => <li key={movie.id} className={cn("group overflow-hidden rounded-xl border border-border/50 bg-card", horizontal && "w-44 shrink-0 snap-start sm:w-52 lg:w-56")}>
        <button type="button" onClick={() => onChooseMovie(movie)} aria-label={`View theaters for ${movie.title}`} className="relative block aspect-[2/3] w-full overflow-hidden bg-neutral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <MoviePoster movie={movie} />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-neutral/80 px-1.5 py-1 text-[9px] text-white"><Clock3 aria-hidden="true" className="size-2.5" />{movie.duration_minutes}m</span>
        </button>
        <div className="p-2.5 sm:p-3"><h3 className="text-sm font-semibold sm:text-sm" title={movie.title}><button type="button" onClick={() => onChooseMovie(movie)} className="min-h-10 max-w-full line-clamp-2 text-left hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">{movie.title}</button></h3><p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground sm:text-[11px]" title={`${movie.genre} · ${movie.language}`}>{movie.genre} · {movie.language}</p>
          <BookingButton destination={movieTheatersRoute(movie.id, city, date)} aria-label={`Book tickets for ${movie.title}`} className="mt-3 h-9 w-full rounded-md px-2 text-xs text-white">Book Tickets</BookingButton>
        </div>
      </li>)}
      {horizontal && batch.hasMore && <li className="shrink-0 self-center"><LoadMoreBatch hasMore={batch.hasMore} loadMore={batch.loadMore} label="movies" root={list} /></li>}
    </ul>
    {!horizontal && <LoadMoreBatch hasMore={batch.hasMore} loadMore={batch.loadMore} label="movies" />}
  </section>;
}
