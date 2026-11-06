"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useMockData } from "@/features/mock-data/components/mock-data-provider";
import { getHomeContent } from "@/features/home/services/home-content-service";
import { HomeExperience } from "@/features/home/components/home-experience";
import { MovieResults } from "@/features/movies/components/movie-results";
import { MovieTheaters } from "@/features/movies/components/movie-theaters";
import { ShowtimeSeatSelection } from "@/features/seats/components/showtime-seat-selection";
import { ROUTES } from "@/lib/constants/routes";

type Props = { view: "home" | "movies" | "theaters" | "seats"; movieId?: string; showtimeId?: string; city?: string; date?: string; query?: string };
export function MockCustomerContent(props: Props) {
  const { data, loading, error } = useMockData();
  const content = useMemo(() => data ? getHomeContent(new Date(), { movieId: props.movieId, showtimeId: props.showtimeId, includeInventory: props.view === "theaters" || props.view === "seats" }, data) : null, [data, props.movieId, props.showtimeId, props.view]);
  if (loading) return <p role="status" className="py-8 text-sm">Loading this browser’s mock data…</p>;
  if (error || !content) return <div role="alert" className="rounded-xl border bg-card p-5 text-sm"><p>{error || "Mock data is unavailable."}</p><Link href={ROUTES.mockData} className="mt-3 inline-block text-primary underline">Open Mock Data Management to recover data</Link></div>;
  if (props.view === "home") return <HomeExperience key={content.cities.join("|")} content={content} />;
  if (props.view === "movies") return <MovieResults key={`${props.city}-${props.date}-${props.query}`} content={content} initialCity={props.city} initialDate={props.date} initialQuery={props.query} />;
  if (props.view === "theaters") {
    const movie = content.movies.find(item => item.id === props.movieId);
    return movie ? <MovieTheaters key={movie.id} content={content} movie={movie} initialCity={props.city} initialDate={props.date} /> : <Missing />;
  }
  const show = content.shows.find(item => item.id === props.showtimeId);
  return show ? <ShowtimeSeatSelection key={show.id} content={content} show={show} /> : <Missing />;
}
function Missing() { return <div className="py-8"><h1 className="text-xl font-semibold">Movie or showtime unavailable</h1><p className="mt-2 text-sm">This record may have been removed, deactivated, or is outside the upcoming one-week schedule.</p><Link href={ROUTES.movies} className="mt-4 inline-block text-primary underline">Explore movies</Link></div>; }
