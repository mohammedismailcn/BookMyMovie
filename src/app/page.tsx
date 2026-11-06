import { MockCustomerContent } from "@/features/mock-data/components/mock-customer-content";


export const dynamic = "force-dynamic";

export default function Home() {

  return <main className="flex-1 bg-indigo-50/40 px-4 pb-12 pt-5 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><MockCustomerContent view="home" /></div></main>;
}
