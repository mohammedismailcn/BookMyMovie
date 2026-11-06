"use client";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useMockBookings } from "@/features/bookings/hooks/use-mock-bookings";
import { BookingTicket } from "@/features/bookings/components/booking-ticket";
import { ROUTES, showtimeSeatsRoute } from "@/lib/constants/routes";

export function BookingSuccess({ bookingId }: { bookingId: string }) {
  const { user } = useAuth();
  const { bookings, loading, error } = useMockBookings();
  const booking = bookings.find((item) => item.id === bookingId && item.user_id === user?.id);
  if (loading) return <p role="status">Loading booking confirmation…</p>;
  if (error) return <p role="alert" className="rounded-xl border bg-card p-5 text-sm text-destructive">{error}</p>;
  if (!booking) return <><h1 className="text-2xl font-semibold">Booking not found</h1><p className="mt-3 text-sm text-muted-foreground">This booking is not saved for your account in this browser.</p><Link href={ROUTES.myBookings} className="mt-5 inline-block text-primary underline">View My Bookings</Link></>;
  return <><div className="mb-7 text-center"><CheckCircle2 className="mx-auto mb-3 size-12 text-tertiary" aria-hidden="true" /><h1 className="text-3xl font-semibold">Booking confirmed!</h1><p className="mt-3 text-sm text-muted-foreground">Your demo tickets are saved. No payment was collected.</p></div><BookingTicket booking={booking} /><div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-medium text-primary"><Link href={ROUTES.myBookings} className="rounded-lg border bg-card px-4 py-3 hover:underline">My Bookings</Link><Link href={showtimeSeatsRoute(booking.showtime_id)} className="rounded-lg border bg-card px-4 py-3 hover:underline">View this show’s seats</Link><Link href={ROUTES.movies} className="px-4 py-3 hover:underline">Explore movies</Link></div><p className="mt-6 text-center text-xs leading-5 text-muted-foreground">This confirmation exists only in this browser profile. Clearing its localStorage removes these demo bookings.</p></>;
}
