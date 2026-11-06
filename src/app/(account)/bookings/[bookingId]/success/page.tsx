import { BookingSuccess } from "@/features/bookings/components/booking-success";
export const metadata = { title: "Booking confirmation | BookMyMovie" };
export default async function BookingSuccessPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return <main className="flex-1 bg-indigo-50/40 px-4 py-8 sm:px-6"><div className="mx-auto max-w-3xl"><BookingSuccess bookingId={bookingId} /></div></main>;
}
