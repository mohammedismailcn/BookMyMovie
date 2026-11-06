export type ShowSeatStatus = "AVAILABLE" | "HELD" | "BOOKED";
export type ShowSeat = {
  id: string;
  showtime_id: string;
  seat_id: string;
  status: ShowSeatStatus;
  price: number;
  held_until: string | null;
  created_at: string;
};
