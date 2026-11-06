import type { HomeContent, HomeShow } from "@/features/home/services/home-content-service";
import { getShowSeatStatus } from "@/features/showtimes/services/show-seat-availability";

const showDateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
export function localShowDate(value: string): string {
  return showDateFormatter.format(new Date(value));
}

export function filterHomeShows(shows: readonly HomeShow[], city: string, date: string, query: string): HomeShow[] {
  const term = query.trim().toLowerCase();
  return shows.filter((show) => show.city === city && show.date === date &&
    `${show.movie.title} ${show.movie.description} ${show.movie.language} ${show.movie.genre} ${show.theater.name}`.toLowerCase().includes(term));
}

export function getPreviewSeats(content: HomeContent, show: HomeShow, at: Date = new Date(content.asOf)) {
  const inventoryBySeat = new Map(content.inventory.filter((item) => item.showtime_id === show.id).map((item) => [item.seat_id, item]));
  return content.seats.filter((seat) => seat.screen_id === show.screen_id).flatMap((seat) => {
    const inventory = inventoryBySeat.get(seat.id);
    const status = inventory ? getShowSeatStatus(inventory, at) : "BOOKED";
    return inventory ? [{ id: seat.id, label: `${seat.row_label}${seat.seat_number}`, row: seat.row_label, rowIndex: seat.row_index, columnIndex: seat.column_index, number: seat.seat_number, type: seat.seat_type,
      reserved: status !== "AVAILABLE", status, vip: seat.seat_type === "RECLINER" || seat.seat_type === "PREMIUM", price: inventory.price }] : [];
  });
}
export type PreviewSeat = ReturnType<typeof getPreviewSeats>[number];

export type { HomeContent, HomeShow } from "@/features/home/services/home-content-service";
