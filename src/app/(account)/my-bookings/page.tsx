import type { Metadata } from "next";
import { MyBookings } from "@/features/bookings/components/my-bookings";
export const metadata: Metadata = { title: "My bookings | BookMyMovie" };
export default function MyBookingsPage() {
  return <main className="flex-1 bg-indigo-50/40 px-4 py-8 sm:px-6"><div className="mx-auto max-w-3xl"><MyBookings /></div></main>;
}
