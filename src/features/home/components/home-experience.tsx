"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { movieTheatersRoute, moviesRoute } from "@/lib/constants/routes";
import type { Movie } from "@/features/movies/types/movie-types";
import type { HomeContent } from "@/features/home/services/home-content-service";
import { filterHomeShows } from "@/features/home/services/home-content-utils";
import { HomeDiscovery } from "@/features/movies/components/home-discovery";
import { HomeTheaters } from "@/features/theaters/components/home-theaters";

export function HomeExperience({ content }: { content: HomeContent }) {
  const router = useRouter();
  const [clock, setClock] = useState(content.asOf);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date().toISOString()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const [city, setCity] = useState(content.cities[0] ?? "");
  const [date, setDate] = useState(content.dates[0]?.value ?? "");
  const [query, setQuery] = useState("");
  const shows = filterHomeShows(content.shows.filter((show) => Date.parse(show.starts_at) > Date.parse(clock)), city, date, query);
  const dates = content.dates.filter((day) => content.shows.some((show) => show.city === city && show.date === day.value && Date.parse(show.starts_at) > Date.parse(clock)));
  function chooseCity(value: string) {
    const cityShows = content.shows.filter((show) => show.city === value && Date.parse(show.starts_at) > Date.parse(clock));
    const nextShow = cityShows.find((show) => show.date === date) ?? cityShows[0];
    setCity(value);
    setDate(nextShow?.date ?? "");
  }
  const visibleMovies = content.movies.filter((movie) => shows.some((show) => show.movie_id === movie.id));
  function chooseMovie(movie: Movie) {
    router.push(movieTheatersRoute(movie.id, city, date));
  }


  return <>
    <HomeDiscovery movies={visibleMovies} featuredMovies={content.featuredMovies} dates={dates} cities={content.cities}
      hub={city} date={date} query={query} onCityChange={chooseCity} onDateChange={setDate} onQueryChange={setQuery} onChooseMovie={chooseMovie}
      onFindShows={() => router.push(moviesRoute(city, date, query))} />
    <HomeTheaters theaters={content.theaters.filter((theater) => theater.city === city)} shows={shows} city={city} date={date} />
  </>;
}
