import type { AuthUser } from "@/features/auth/types/auth-types";
import { authService } from "@/features/auth/services/auth-service";
import type { HomeContent } from "@/features/home/services/home-content-service";
import { getPreviewSeats, localShowDate } from "@/features/home/services/home-content-utils";
import { getShowAvailability } from "@/features/showtimes/services/showtime-discovery";
import { applyConfirmedBookings } from "@/features/bookings/services/booking-availability";
import { MOCK_BOOKINGS_CHANGED, MOCK_BOOKINGS_KEY, parseMockBookings, readMockBookings } from "@/features/bookings/services/mock-booking-store";
import type { MockBooking } from "@/features/bookings/types/booking-types";

export type ConfirmBookingInput = { requestId: string; showtimeId: string; seatIds: readonly string[] };

export function createConfirmedBooking(content: HomeContent, existing: readonly MockBooking[], user: Pick<AuthUser, "id">, input: ConfirmBookingInput, at: Date): MockBooking {
  if (!user.id) throw new Error("Please log in before confirming a booking.");
  if (!Number.isFinite(at.getTime()) || !/^[a-zA-Z0-9-]{8,80}$/.test(input.requestId)) throw new Error("Unable to identify this booking request. Please try again.");
  const duplicate = existing.find((booking) => booking.id === input.requestId);
  if (duplicate) {
    if (duplicate.user_id === user.id && duplicate.showtime_id === input.showtimeId && [...duplicate.seat_ids].sort().join("|") === [...input.seatIds].sort().join("|")) return duplicate;
    throw new Error("This booking request has already been used.");
  }
  if (!input.seatIds.length || input.seatIds.length > 6 || new Set(input.seatIds).size !== input.seatIds.length) throw new Error("Choose between 1 and 6 different seats.");
  const show = content.shows.find((item) => item.id === input.showtimeId);
  if (!show || !show.movie.is_active || !show.screen.is_active || !content.theaters.some((theater) => theater.id === show.theater.id && theater.id === show.screen.theater_id)) throw new Error("This showtime is invalid. Please choose another show.");
  const current = applyConfirmedBookings(content, existing);
  if (getShowAvailability(current, show, at).status !== "AVAILABLE") throw new Error("This show is no longer available. Please choose another showtime.");
  const seats = getPreviewSeats(current, show, at);
  const chosen = input.seatIds.map((id) => seats.find((seat) => seat.id === id));
  if (chosen.some((seat) => !seat || seat.reserved)) throw new Error("Some selected seats are no longer available. Please choose your seats again.");
  const seat_details = chosen.flatMap((seat) => seat ? [{ seat_id: seat.id, label: seat.label, price: seat.price }] : []);
  const total_amount = seat_details.reduce((sum, seat) => sum + Math.round(seat.price * 100), 0) / 100;
  return {
    id: input.requestId, booking_number: `BMM-${localShowDate(at.toISOString()).replaceAll("-", "")}-${input.requestId.toUpperCase()}`,
    user_id: user.id, showtime_id: show.id, movie_id: show.movie_id, theater_id: show.theater.id, screen_id: show.screen_id,
    seat_ids: seat_details.map((seat) => seat.seat_id), seat_details, total_amount, status: "CONFIRMED", created_at: at.toISOString(), starts_at: show.starts_at,
    movie_title: show.movie.title, poster_url: show.movie.poster_url, theater_name: show.theater.name, theater_location: show.theater.location, screen_name: show.screen.name,
  };
}

/** One synchronous read/check/write under a same-browser Web Lock when supported. No server authorization. */
export async function confirmMockBooking(content: HomeContent, input: ConfirmBookingInput): Promise<MockBooking> {
  const commit = async () => {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Your session has ended. Please log in again.");
    const existing = readMockBookings();
    const booking = createConfirmedBooking(content, existing, user, input, new Date());
    if (existing.some((item) => item.id === booking.id)) return booking;
    const updated = [...existing, booking];
    parseMockBookings(JSON.stringify(updated));
    try { window.localStorage.setItem(MOCK_BOOKINGS_KEY, JSON.stringify(updated)); }
    catch { throw new Error("Could not save your booking. No confirmation was created. Check browser storage and try again."); }
    window.dispatchEvent(new Event(MOCK_BOOKINGS_CHANGED));
    return booking;
  };
  if (typeof navigator !== "undefined" && navigator.locks) return navigator.locks.request(MOCK_BOOKINGS_KEY, commit);
  return commit();
}
