"use client";

import { useMemo } from "react";
import { useMockBookings } from "@/features/bookings/hooks/use-mock-bookings";
import { applyConfirmedBookings } from "@/features/bookings/services/booking-availability";
import { BookingButton } from "@/features/auth/components/booking-button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoviePoster } from "@/features/movies/components/movie-poster";
import type { HomeContent } from "@/features/home/services/home-content-service";
import { getMovieTheaterGroups } from "@/features/showtimes/services/showtime-discovery";
import type { Movie } from "@/features/movies/types/movie-types";
import { ROUTES, movieTheatersRoute, showtimeSeatsRoute } from "@/lib/constants/routes";

const time = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
const releaseDate = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });

export function MovieTheaters({ content, movie, initialCity, initialDate }: {
  content: HomeContent; movie: Movie; initialCity?: string; initialDate?: string;
}) {
  const browserBookings=useMockBookings();
  const currentContent=useMemo(()=>applyConfirmedBookings(content,browserBookings.bookings),[content,browserBookings.bookings]);
  const [clock, setClock] = useState(content.asOf);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date().toISOString()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const movieShows = content.shows.filter((show) => show.movie_id === movie.id && Date.parse(show.starts_at) > Date.parse(clock));
  const [city, setCity] = useState(initialCity && content.cities.includes(initialCity) ? initialCity : movieShows[0]?.city ?? content.cities[0] ?? "");
  const dates = content.dates.filter((day) => movieShows.some((show) => show.city === city && show.date === day.value));
  const [requestedDate, setDate] = useState(initialDate ?? "");
  const date = dates.some((day) => day.value === requestedDate) ? requestedDate : dates[0]?.value ?? "";
  const groups = browserBookings.loading || browserBookings.error ? [] : getMovieTheaterGroups(currentContent, movie.id, city, date, new Date(clock));
  function focusShows() {
    const heading = document.getElementById("movie-showtimes-heading");
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <>
    <Link href={ROUTES.home} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" aria-hidden="true" />Back to movies</Link>
    <header className="relative isolate overflow-hidden rounded-2xl bg-neutral text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral via-neutral/90 to-neutral/30" />
      <div className="flex items-start gap-5 p-5 sm:gap-8 sm:p-9 lg:items-center lg:p-12">
        <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-lg border border-white/15 shadow-xl sm:w-44 lg:w-52"><MoviePoster movie={movie} /></div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{movie.title}</h1>
          <p className="mt-3 text-xs leading-6 text-slate-200 sm:text-sm">{movie.genre}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-200"><span>{movie.language}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden="true" />{movie.duration_minutes} min</span><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden="true" />{releaseDate.format(new Date(movie.release_date))}</span></div>
          <BookingButton destination={movieTheatersRoute(movie.id,city,date)} onAuthenticated={focusShows} className="mt-5 min-h-11 rounded-lg px-6 text-white"><Ticket aria-hidden="true" />Book Tickets</BookingButton>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 sm:px-9 lg:px-12"><h2 className="text-sm font-semibold">About the movie</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-200">{movie.description || "Movie information will be available soon."}</p></div>
    </header>

    <section aria-labelledby="movie-showtimes-heading" className="mt-9 sm:mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Make it a movie night</p><h2 id="movie-showtimes-heading" tabIndex={-1} className="mt-2 scroll-mt-6 text-2xl font-semibold tracking-tight focus:outline-none sm:text-3xl">Theaters & showtimes</h2><p className="mt-2 text-xs text-muted-foreground">Times in IST. Choose a show to pick your seats.</p></div>
        <div><label htmlFor="movie-city" className="mb-1.5 block text-xs font-medium">Choose city</label><select id="movie-city" value={city} onChange={(event) => { setCity(event.target.value); setDate(""); }} className="min-h-11 min-w-44 rounded-lg border bg-card px-3 text-sm focus-visible:outline-ring">{content.cities.map((value) => <option key={value}>{value}</option>)}</select></div>
      </div>
      <div role="group" aria-label="Choose movie show date" className="my-6 grid grid-cols-4 gap-2 sm:grid-cols-7">{dates.map((day) => <Button key={day.value} aria-label={`${day.weekday} ${day.label}`} aria-pressed={date === day.value} onClick={() => setDate(day.value)} variant={date === day.value ? "default" : "outline"} className={`h-auto min-h-16 min-w-0 flex-col gap-1 rounded-xl px-1 py-3 ${date === day.value ? "text-white" : "bg-card"}`}><span className="text-[10px] uppercase">{day.weekday}</span><span className="text-sm font-semibold">{day.label}</span></Button>)}</div>
      <p role="status" className="mb-4 text-xs text-muted-foreground">{groups.length} {groups.length === 1 ? "theater" : "theaters"} showing {movie.title} in {city}{date ? ` · ${dates.find((day) => day.value === date)?.label}` : ""}</p>
      {browserBookings.loading && <p role="status" className="my-5 text-sm">Checking browser seat availability…</p>}
      {browserBookings.error && <p role="alert" className="my-5 rounded-lg border p-4 text-sm text-destructive">{browserBookings.error}</p>}
      {!groups.length && !browserBookings.loading && !browserBookings.error && <div className="rounded-xl border bg-card p-8 text-center"><Ticket className="mx-auto size-8 text-primary" aria-hidden="true" /><h3 className="mt-3 font-semibold">No shows scheduled just yet</h3><p className="mt-2 text-sm text-muted-foreground">Try another city or check back for new showtimes.</p><Link href={ROUTES.home} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">Explore other movies</Link></div>}
      <div className="space-y-4">{groups.map(({ theater, screens }) => <article key={theater.id} className="overflow-hidden rounded-xl border border-border/60 bg-card sm:flex">
        <div className="border-b bg-muted/25 p-5 sm:w-72 sm:shrink-0 sm:border-b-0 sm:border-r sm:p-6"><h3 className="font-semibold">{theater.name}</h3><p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground"><MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{theater.location}</p></div>
        <div className="min-w-0 flex-1 divide-y">{screens.map(({ screen, shows }) => <div key={screen.id} className="p-5 sm:p-6"><h4 className="mb-3 text-xs font-semibold">{screen.name}</h4><div className="flex flex-wrap gap-3">{shows.map(({ show, availability }) => {
          const label = availability.status === "SOLD_OUT" ? "Housefull" : availability.status === "UNAVAILABLE" ? "Unavailable" : `${availability.available} seats available`;
          return <div key={show.id} className="min-w-32"><Button nativeButton={availability.status !== "AVAILABLE"} render={availability.status === "AVAILABLE" ? <Link href={showtimeSeatsRoute(show.id)} /> : undefined} disabled={availability.status !== "AVAILABLE"} aria-label={`${time.format(new Date(show.starts_at))}, ${screen.name}, ${theater.name}, ${label}`} variant="outline" className="h-auto min-h-12 w-full flex-col gap-1 rounded-lg border-tertiary/30 px-4 py-2 text-tertiary hover:bg-tertiary/5 disabled:text-muted-foreground"><span className="font-semibold">{time.format(new Date(show.starts_at))}</span><span className="text-[10px]">{availability.status === "AVAILABLE" ? `From ₹${show.base_price}` : label}</span></Button><p className="mt-1.5 text-center text-[9px] text-muted-foreground">{availability.status === "AVAILABLE" ? `${availability.available} seats` : label}</p></div>;
        })}</div></div>)}</div>
      </article>)}</div>
      <p className="mt-5 text-[11px] leading-5 text-muted-foreground">Demo showtimes and inventory. Seat selections do not create a reservation.</p>
    </section>
  </>;
}
