"use client";
import Image from "next/image";
import { useState } from "react";
import { Film } from "lucide-react";
import type { Movie } from "@/features/movies/types/movie-types";
export function MoviePoster({ movie }: { movie: Pick<Movie, "title" | "poster_url"> }) {
  const [failed, setFailed] = useState(false);
  const source = movie.poster_url;
  return source && !failed ? <Image src={source} alt={`${movie.title} movie poster`} fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" onError={() => setFailed(true)} className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" /> : <div role="img" aria-label={`${movie.title} · poster not available`} className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-700 to-neutral p-4 text-center text-white"><Film className="size-9 text-secondary" aria-hidden="true" /><span className="text-sm font-semibold">{movie.title}</span><span className="text-[10px] text-slate-300">Poster coming soon</span></div>;
}
