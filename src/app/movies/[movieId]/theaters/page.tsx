
import { getHomeContent } from "@/features/home/services/home-content-service";
import { MockCustomerContent } from "@/features/mock-data/components/mock-customer-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ movieId: string }> }) {
  const { movieId } = await params;
  const movie = getHomeContent(new Date(), { movieId }).movies.find((item) => item.id === movieId);
  return { title: movie ? `${movie.title} - Tickets & showtimes | BookMyMovie` : "Movie details | BookMyMovie" };
}

export default async function MovieTheatersPage({ params, searchParams }: {
  params: Promise<{ movieId: string }>;
  searchParams: Promise<{ city?: string | string[]; date?: string | string[] }>;
}) {
  const { movieId } = await params;
  const filters = await searchParams;

  return <main className="flex-1 bg-indigo-50/40 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><MockCustomerContent view="theaters" movieId={movieId} city={typeof filters.city === "string" ? filters.city : undefined} date={typeof filters.date === "string" ? filters.date : undefined} /></div></main>;
}
