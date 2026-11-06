import * as seed from "@/lib/mock-data";
import type { MockDatabase } from "@/features/mock-data/types/mock-database";
import type { ShowSeat } from "@/features/showtimes/types/show-seat-types";

const inventory = new Map(seed.show_seats.map(item => [item.id, item]));
const assignments = new Set(seed.booking_seats.map(item => item.show_seat_id));
/** Preserve independent seeded occupancy; booking-owned occupancy comes only from current confirmed bookings. */
export function buildMockInventory(database: MockDatabase, showIds: ReadonlySet<string>): ShowSeat[] {
  const confirmed = new Set(database.bookings.filter(item => item.status === "CONFIRMED").flatMap(item => item.seat_ids.map(id => `${item.showtime_id}-${id}`)));
  const seats = new Map<string, MockDatabase["seats"]>();
  for (const seat of database.seats) seats.set(seat.screen_id, [...(seats.get(seat.screen_id) ?? []), seat]);
  return database.showtimes.filter(show => showIds.has(show.id)).flatMap(show => (seats.get(show.screen_id) ?? []).map(seat => {
    const id = `${show.id}-${seat.id}`;
    const original = inventory.get(id);
    const baseline = assignments.has(id) ? "AVAILABLE" : original?.status ?? "AVAILABLE";
    const status = confirmed.has(id) ? "BOOKED" : baseline;
    return { id, showtime_id: show.id, seat_id: seat.id, status,
      price: show.base_price + (seat.seat_type === "PREMIUM" ? 50 : seat.seat_type === "RECLINER" ? 120 : 0),
      held_until: status === "HELD" ? original?.held_until ?? null : null, created_at: show.created_at };
  }));
}
