import { HomeExperience } from "@/features/home/components/home-experience";
import { getHomeContent } from "@/features/home/services/home-content-service";

export const dynamic = "force-dynamic";

export default function Home() {
  const content = getHomeContent(new Date(), { includeInventory: false });
  return <main className="flex-1 bg-indigo-50/40 px-4 pb-12 pt-5 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><HomeExperience content={content} /></div></main>;
}
