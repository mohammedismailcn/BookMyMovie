import * as seed from "@/lib/mock-data";
import { DEMO_ACCOUNT } from "@/features/auth/services/mock-auth-adapter";
import type { Movie } from "@/features/movies/types/movie-types";
import type { MockBooking } from "@/features/bookings/types/booking-types";

export type MockUser = { id: string; name: string; email: string; created_at: string };
export type MockDatabase = {
  movies: Movie[];
  theaters: { id: string; name: string; location: string; created_at: string }[];
  screens: (typeof seed.screens)[number][];
  showtimes: (typeof seed.showtimes)[number][];
  seats: (typeof seed.seats)[number][];
  bookings: MockBooking[];
  users: MockUser[];
};
export const TABLES = ["movies", "theaters", "screens", "showtimes", "seats", "bookings", "users"] as const;
export type MockTable = typeof TABLES[number];

function defaultBookings(): MockBooking[] {
  return seed.bookings.map(booking => {
    const show = seed.showtimes.find(item => item.id === booking.showtime_id)!;
    const movie = seed.movies.find(item => item.id === show.movie_id)!;
    const screen = seed.screens.find(item => item.id === show.screen_id)!;
    const theater = seed.theaters.find(item => item.id === screen.theater_id)!;
    const seat_details = seed.booking_seats.filter(item => item.booking_id === booking.id).map(item => {
      const inventory = seed.show_seats.find(row => row.id === item.show_seat_id)!;
      const seat = seed.seats.find(row => row.id === inventory.seat_id)!;
      return { seat_id: seat.id, label: `${seat.row_label}${seat.seat_number}`, price: item.price_at_booking };
    });
    return { id: booking.id, booking_number: booking.booking_number, user_id: booking.user_id, showtime_id: show.id,
      movie_id: movie.id, theater_id: theater.id, screen_id: screen.id, seat_ids: seat_details.map(item => item.seat_id), seat_details,
      total_amount: booking.total_amount, status: booking.status, created_at: booking.created_at, starts_at: show.starts_at,
      movie_title: movie.title, poster_url: movie.poster_url, theater_name: theater.name, theater_location: theater.location, screen_name: screen.name };
  });
}
export const DEFAULT_MOCK_DATABASE: MockDatabase = {
  movies: [...seed.movies], theaters: [...seed.theaters], screens: [...seed.screens], showtimes: [...seed.showtimes], seats: [...seed.seats],
  bookings: defaultBookings(), users: [...seed.users, { id: DEMO_ACCOUNT.id, name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email, created_at: "2026-11-01T09:00:00Z" }],
};
