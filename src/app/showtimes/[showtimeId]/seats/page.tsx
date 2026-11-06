import { AuthGate } from "@/features/auth/components/auth-gate";
import { notFound } from "next/navigation";
import { getHomeContent } from "@/features/home/services/home-content-service";
import { ShowtimeSeatSelection } from "@/features/seats/components/showtime-seat-selection";

export const dynamic = "force-dynamic";
export const metadata = { title: "Choose your seats | BookMyMovie" };

export default async function ShowtimeSeatsPage({ params }: { params: Promise<{ showtimeId: string }> }) {
  const { showtimeId } = await params;
  const content = getHomeContent(new Date(), { showtimeId });
  const show = content.shows.find((item) => item.id === showtimeId);
  if (!show) notFound();
  return <AuthGate><main className="flex-1 bg-indigo-50/40 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><ShowtimeSeatSelection key={show.id} content={content} show={show} /></div></main></AuthGate>;
}
