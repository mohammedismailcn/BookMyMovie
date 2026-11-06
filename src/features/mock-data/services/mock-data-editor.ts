import { localShowDate } from "@/features/home/services/home-content-utils";
import { parseMockBookings } from "@/features/bookings/services/booking-validation";
import { DEFAULT_MOCK_DATABASE, type MockDatabase, type MockTable } from "@/features/mock-data/types/mock-database";
import { object, validateMockDatabase } from "@/features/mock-data/services/mock-data-validation";
import { updateMockDatabase } from "@/features/mock-data/services/mock-data-store";
import { buildMockInventory } from "@/features/mock-data/services/mock-inventory";
import type { MockBooking } from "@/features/bookings/types/booking-types";

export function bookingDraft(booking: MockBooking) {
  return { id: booking.id, booking_number: booking.booking_number, user_id: booking.user_id, showtime_id: booking.showtime_id, seat_ids: booking.seat_ids, status: booking.status, created_at: booking.created_at };
}
export function recordTemplate(table: MockTable): Record<string, unknown> {
  const first = DEFAULT_MOCK_DATABASE[table][0];
  return table === "bookings" ? bookingDraft(DEFAULT_MOCK_DATABASE.bookings[0]) : { ...first };
}
export function newMockRecord(table: MockTable, db: MockDatabase): Record<string, unknown> {
  const now = new Date().toISOString();
  const template = recordTemplate(table);
  const id = crypto.randomUUID();
  const common = { ...template, id, ...( "created_at" in template ? { created_at: now } : {}) };
  if (table === "bookings") return { ...common, booking_number: `BMM-${id.toUpperCase()}`, user_id: db.users[0]?.id ?? "", showtime_id: db.showtimes[0]?.id ?? "", seat_ids: [], status: "CONFIRMED" };
  if (table === "movies") return { ...common, title: "New movie", description: "", poster_url: "/assets/movie-placeholder.svg", release_date: localShowDate(now) };
  if (table === "theaters") return { ...common, name: "New theater", location: "Area, City" };
  if (table === "users") return { ...common, name: "New mock user", email: "" };
  if (table === "screens") return { ...common, name: "New screen", theater_id: db.theaters[0]?.id ?? "", screen_number: 1, capacity: 0 };
  if (table === "showtimes") return { ...common, movie_id: db.movies[0]?.id ?? "", screen_id: db.screens[0]?.id ?? "", starts_at: now, ends_at: new Date(Date.now() + 4*3600000).toISOString() };
  return { ...common, screen_id: db.screens[0]?.id ?? "" };
}
function hydrateBooking(draft: Record<string, unknown>, db: MockDatabase, previous?: MockBooking): MockBooking {
  const show = db.showtimes.find(item => item.id === draft.showtime_id);
  const screen = db.screens.find(item => item.id === show?.screen_id);
  const theater = db.theaters.find(item => item.id === screen?.theater_id);
  const movie = db.movies.find(item => item.id === show?.movie_id);
  if (!show || !screen || !theater || !movie) throw new Error("Select an existing showtime with valid movie, theater and screen references.");
  const ids = draft.seat_ids;
  if (!Array.isArray(ids) || !ids.every((id): id is string => typeof id === "string")) throw new Error("Seat IDs must be a JSON array of strings.");
  const inventory = buildMockInventory(db, new Set([show.id]));
  const snapshots = ids.map(id => {
    const seat = db.seats.find(item => item.id === id && item.screen_id === screen.id);
    const entry = inventory.find(item => item.seat_id === id);
    if (!seat || !entry) throw new Error(`Seat ${id} does not belong to this showtime's screen.`);
    const saved = previous?.showtime_id === show.id ? previous.seat_details.find(item => item.seat_id === id) : undefined;
    return saved ?? { seat_id: seat.id, label: `${seat.row_label}${seat.seat_number}`, price: entry.price };
  });
  const booking = { ...draft, movie_id: movie.id, screen_id: screen.id, theater_id: theater.id, seat_details: snapshots,
    total_amount: snapshots.reduce((total,item) => total + Math.round(item.price*100), 0)/100,
    starts_at: show.starts_at, movie_title: movie.title, poster_url: movie.poster_url, screen_name: screen.name, theater_name: theater.name, theater_location: theater.location };
  // Use the shared booking parser for its public runtime boundary.
  return validateBookingRecord(booking);
}
function validateBookingRecord(value: unknown): MockBooking { return parseMockBookings(JSON.stringify([value]))[0]; }

export function putMockRecord(db: MockDatabase, table: MockTable, input: unknown, original: unknown = null): MockDatabase {
  if (!object(input) || typeof input.id !== "string") throw new Error("A record with an ID is required.");
  const current = db[table].find(item => item.id === input.id);
  if (original === null ? !!current : JSON.stringify(current) !== JSON.stringify(original)) throw new Error("This record was changed in another tab, already exists, or was removed. Reload it before saving.");
  let record = input;
  if (table === "bookings") record = { ...hydrateBooking(input, db, db.bookings.find(item => item.id === input.id)) };
  const records = current ? db[table].map(item => item.id === input.id ? record : item) : [...db[table], record];
  return changedTable(db, table, records);
}
function changedTable(db: MockDatabase, table: MockTable, records: readonly unknown[]): MockDatabase {
  const physical = table === "seats" ? records : db.seats;
  const screenRows = table === "screens" ? records : db.screens;
  const screens = screenRows.map(screen => {
    if (!object(screen)) throw new Error("Invalid screen.");
    return { ...screen, capacity: physical.filter(seat => object(seat) && seat.screen_id === screen.id).length };
  });
  return validateMockDatabase({ ...db, [table]: records, screens });
}
export function removeMockRecord(db: MockDatabase, table: MockTable, id: string, original: unknown): MockDatabase {
  const current = db[table].find(item => item.id === id);
  if (!current || JSON.stringify(current) !== JSON.stringify(original)) throw new Error("This record changed. Reload it before deleting.");
  try { return changedTable(db, table, db[table].filter(item => item.id !== id)); }
  catch (cause) { throw new Error(`Cannot delete this referenced record. Remove dependent bookings, seats, showtimes or screens first. ${cause instanceof Error ? cause.message : ""}`); }
}
export function saveMockRecord(table: MockTable, input: unknown, original: unknown): Promise<void> { return updateMockDatabase(db => putMockRecord(db, table, input, original)); }
export function deleteMockRecord(table: MockTable, id: string, original: unknown): Promise<void> { return updateMockDatabase(db => removeMockRecord(db, table, id, original)); }
