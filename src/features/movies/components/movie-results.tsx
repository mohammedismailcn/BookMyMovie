"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { HomeContent } from "@/features/home/services/home-content-service";
import { filterHomeShows } from "@/features/home/services/home-content-utils";
import { ScreeningFilters } from "@/features/movies/components/screening-filters";
import { CuratedScreenings } from "@/features/movies/components/curated-screenings";
import { movieTheatersRoute, moviesRoute } from "@/lib/constants/routes";

export function MovieResults({ content, initialCity, initialDate, initialQuery }: { content: HomeContent; initialCity?: string; initialDate?: string; initialQuery?: string }) {
  const router=useRouter();
  const [clock,setClock]=useState(content.asOf);
  useEffect(()=>{const timer=window.setInterval(()=>setClock(new Date().toISOString()),30000);return ()=>window.clearInterval(timer);},[]);
  const [city,setCity]=useState(initialCity&&content.cities.includes(initialCity)?initialCity:content.cities[0]??"");
  const dates=content.dates.filter((day)=>content.shows.some((show)=>show.city===city&&show.date===day.value&&Date.parse(show.starts_at)>Date.parse(clock)));
  const [requestedDate,setDate]=useState(initialDate??"");
  const date=dates.some((day)=>day.value===requestedDate)?requestedDate:dates[0]?.value??"";
  const [query,setQuery]=useState(initialQuery??"");
  const shows=filterHomeShows(content.shows.filter((show)=>Date.parse(show.starts_at)>Date.parse(clock)),city,date,query);
  const movies=content.movies.filter((movie)=>shows.some((show)=>show.movie_id===movie.id));
  return <>
    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Movies</h1>
    <p className="mt-2 text-sm text-muted-foreground">Find movies and showtimes for your city and date.</p>
    <ScreeningFilters cities={content.cities} dates={dates} city={city} date={date} query={query} onCityChange={(value)=>{setCity(value);setDate("");router.replace(moviesRoute(value,content.dates.find((day)=>content.shows.some((show)=>show.city===value&&show.date===day.value))?.value??"",query),{scroll:false});}} onDateChange={(value)=>{setDate(value);router.replace(moviesRoute(city,value,query),{scroll:false});}} onQueryChange={setQuery} onSubmit={()=>router.push(moviesRoute(city,date,query))} />
    <p role="status" className="mt-6 text-sm text-muted-foreground">{movies.length} {movies.length===1?"movie":"movies"} · {city}{date?` · ${dates.find((day)=>day.value===date)?.label}`:""}</p>
    <CuratedScreenings city={city} date={date} movies={movies} onChooseMovie={(movie)=>router.push(movieTheatersRoute(movie.id,city,date))} />
  </>;
}
