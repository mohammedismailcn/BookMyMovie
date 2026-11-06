import { MockDataDashboard } from "@/features/mock-data/components/mock-data-dashboard";
export const metadata = { title: "Mock Data Management | BookMyMovie" };
export default function MockDataPage() {
  return <main className="min-w-0 flex-1 bg-muted/30 px-4 py-6 sm:px-6 sm:py-10"><div className="mx-auto max-w-7xl"><MockDataDashboard /></div></main>;
}
