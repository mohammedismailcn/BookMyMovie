import type { AuthUser } from "@/features/auth/types/auth-types";
import { authService } from "@/features/auth/services/auth-service";
import type { HomeContent } from "@/features/home/services/home-content-service";
import { getPreviewSeats, localShowDate } from "@/features/home/services/home-content-utils";
import { getShowAvailability } from "@/features/showtimes/services/showtime-discovery";
import { applyConfirmedBookings } from "@/features/bookings/services/booking-availability";
import { updateMockDatabase } from "@/features/mock-data/services/mock-data-store";
import { getHomeContent } from "@/features/home/services/home-content-service";
import type { MockBooking } from "@/features/bookings/types/booking-types";

export type ConfirmBookingInput = { requestId: string; showtimeId: string; seatIds: readonly string[] };

export function createConfirmedBooking(content: HomeContent, existing: readonly MockBooking[], user: Pick<AuthUser, "id">, input: ConfirmBookingInput, at: Date): MockBooking {
  if (!user.id) throw new Error("Please log in before confirming a booking.");
  if (!Number.isFinite(at.getTime()) || !/^[a-zA-Z0-9-]{8,80}$/.test(input.requestId)) throw new Error("Unable to identify this booking request. Please try again.");
  const duplicate = existing.find((booking) => booking.id === input.requestId);
  if (duplicate) {
    if (duplicate.status === "CONFIRMED" && duplicate.user_id === user.id && duplicate.showtime_id === input.showtimeId && [...duplicate.seat_ids].sort().join("|") === [...input.seatIds].sort().join("|")) return duplicate;
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
export async function confirmMockBooking(input: ConfirmBookingInput): Promise<MockBooking> {
  const user = await authService.getCurrentUser();
  if (!user) throw new Error("Your session has ended. Please log in again.");
  let result: MockBooking | undefined;
  await updateMockDatabase(database => {
    const at = new Date();
    const current = getHomeContent(at, { showtimeId: input.showtimeId }, database);
    const booking = createConfirmedBooking(current, database.bookings, user, input, at);
    result = booking;
    if (database.bookings.some(item => item.id === booking.id)) return database;
    const users = database.users.some(item => item.id === user.id) ? database.users : [...database.users, { id: user.id, name: user.name, email: user.email, created_at: user.createdAt }];
    return { ...database, users, bookings: [...database.bookings, booking] };
  });
  if (!result) throw new Error("Unable to confirm booking.");
  return result;
}
