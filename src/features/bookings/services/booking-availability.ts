import type { HomeContent } from "@/features/home/services/home-content-service";
import type { MockBooking } from "@/features/bookings/types/booking-types";

/** Confirmed browser bookings override show inventory, never permanent physical seats. */
export function applyConfirmedBookings(content: HomeContent, bookings: readonly MockBooking[]): HomeContent {
  if (!bookings.length) return content;
  const confirmed = new Set(bookings.filter((booking) => booking.status === "CONFIRMED").flatMap((booking) => booking.seat_ids.map((seatId) => `${booking.showtime_id}:${seatId}`)));
  return { ...content, inventory: content.inventory.map((seat) => confirmed.has(`${seat.showtime_id}:${seat.seat_id}`) ? { ...seat, status: "BOOKED", held_until: null } : seat) };
}
