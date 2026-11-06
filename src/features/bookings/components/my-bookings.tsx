"use client";
import Link from "next/link";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useMockBookings } from "@/features/bookings/hooks/use-mock-bookings";
import { BookingTicket } from "@/features/bookings/components/booking-ticket";
import { bookingSuccessRoute, ROUTES } from "@/lib/constants/routes";

export function MyBookings() {
  const { user } = useAuth();
  const { bookings, loading, error } = useMockBookings();
  const mine = bookings.filter((booking) => booking.user_id === user?.id).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  return <><h1 className="text-3xl font-semibold">My Bookings</h1><p className="mt-2 text-sm text-muted-foreground">Confirmed demo bookings saved for your account in this browser.</p>
    {loading ? <p role="status" className="mt-8">Loading bookings…</p> : error ? <p role="alert" className="mt-8 rounded-xl border bg-card p-5 text-sm text-destructive">{error}</p> : !mine.length ? <div className="mt-8 rounded-xl border bg-card p-8 text-center"><h2 className="font-semibold">Your next movie night starts here</h2><p className="mt-2 text-sm text-muted-foreground">No confirmed bookings for this account in this browser yet.</p><Link href={ROUTES.movies} className="mt-5 inline-block text-sm font-medium text-primary underline">Explore movies</Link></div> : <ul className="mt-8 space-y-6">{mine.map((booking) => <li key={booking.id}><BookingTicket booking={booking} /><Link href={bookingSuccessRoute(booking.id)} className="mt-2 inline-block px-1 text-sm font-medium text-primary underline">View booking confirmation</Link></li>)}</ul>}
  </>;
}
