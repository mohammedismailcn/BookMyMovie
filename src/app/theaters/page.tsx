import { MockCustomerContent } from "@/features/mock-data/components/mock-customer-content";

export const metadata = { title: "Theaters | BookMyMovie" };

export default function TheatersPage() {
  return <main className="min-w-0 flex-1 bg-indigo-50/40 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><MockCustomerContent view="theater-directory" /></div></main>;
}
