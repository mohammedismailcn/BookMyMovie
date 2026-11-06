import { getHomeContent } from "@/features/home/services/home-content-service";
import { MovieResults } from "@/features/movies/components/movie-results";

export const dynamic = "force-dynamic";
export const metadata = { title: "Movies & showtimes | BookMyMovie" };
export default async function MoviesPage({ searchParams }: { searchParams: Promise<{city?:string|string[];date?:string|string[];q?:string|string[]}> }) {
  const filters=await searchParams;
  const city=typeof filters.city==="string"?filters.city:undefined;
  const date=typeof filters.date==="string"?filters.date:undefined;
  const query=typeof filters.q==="string"?filters.q:undefined;
  const content=getHomeContent(new Date(),{includeInventory:false});
  return <main className="flex-1 bg-indigo-50/40 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><MovieResults key={`${city}-${date}-${query}`} content={content} initialCity={city} initialDate={date} initialQuery={query} /></div></main>;
}
