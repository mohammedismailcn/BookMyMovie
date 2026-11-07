import { AuthGate } from "@/features/auth/components/auth-gate";


import { MockCustomerContent } from "@/features/mock-data/components/mock-customer-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Choose your seats | BookMyMovie" };

export default async function ShowtimeSeatsPage({ params }: { params: Promise<{ showtimeId: string }> }) {
  const { showtimeId } = await params;

  return <AuthGate><main className="min-w-0 w-full flex-1 overflow-x-clip bg-indigo-50/40 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto min-w-0 w-full max-w-7xl"><MockCustomerContent view="seats" showtimeId={showtimeId} /></div></main></AuthGate>;
}
