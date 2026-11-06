export type BookingSeatSnapshot = { seat_id: string; label: string; price: number };

/** Browser-only confirmed ticket. Display/price snapshots survive catalog changes. */
export type MockBooking = {
  id: string;
  booking_number: string;
  user_id: string;
  showtime_id: string;
  movie_id: string;
  theater_id: string;
  screen_id: string;
  seat_ids: string[];
  seat_details: BookingSeatSnapshot[];
  total_amount: number;
  status: "CONFIRMED";
  created_at: string;
  starts_at: string;
  movie_title: string;
  poster_url: string;
  theater_name: string;
  theater_location: string;
  screen_name: string;
};
