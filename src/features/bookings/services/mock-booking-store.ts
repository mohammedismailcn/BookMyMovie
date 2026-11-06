import type { MockBooking, BookingSeatSnapshot } from "@/features/bookings/types/booking-types";

export const MOCK_BOOKINGS_KEY = "bookmymovie_bookings";
export const MOCK_BOOKINGS_CHANGED = "bookmymovie:bookings-changed";
export const BOOKING_STORAGE_UNAVAILABLE = "__booking_storage_unavailable__";

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new Error("Invalid saved booking details.");
  return value;
}
function amount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || Math.abs(value * 100 - Math.round(value * 100)) > 0.00001) throw new Error("Invalid saved ticket price.");
  return value;
}
function timestamp(value: unknown): string {
  const result = text(value);
  if (!Number.isFinite(Date.parse(result))) throw new Error("Invalid saved booking date.");
  return result;
}
function parseBooking(value: unknown): MockBooking {
  if (!record(value) || value.status !== "CONFIRMED" || !Array.isArray(value.seat_ids) || !Array.isArray(value.seat_details)) throw new Error("Invalid saved booking.");
  const seat_ids = value.seat_ids.map(text);
  const seat_details: BookingSeatSnapshot[] = value.seat_details.map((item: unknown) => {
    if (!record(item)) throw new Error("Invalid saved seat.");
    return { seat_id: text(item.seat_id), label: text(item.label), price: amount(item.price) };
  });
  const total_amount = amount(value.total_amount);
  if (!seat_ids.length || seat_ids.length > 6 || new Set(seat_ids).size !== seat_ids.length || seat_details.length !== seat_ids.length || seat_details.some((seat, index) => seat.seat_id !== seat_ids[index]) || seat_details.reduce((sum, seat) => sum + Math.round(seat.price * 100), 0) !== Math.round(total_amount * 100)) throw new Error("Inconsistent saved booking seats or total.");
  return {
    id: text(value.id), booking_number: text(value.booking_number), user_id: text(value.user_id),
    showtime_id: text(value.showtime_id), movie_id: text(value.movie_id), theater_id: text(value.theater_id), screen_id: text(value.screen_id),
    seat_ids, seat_details, total_amount, status: "CONFIRMED", created_at: timestamp(value.created_at), starts_at: timestamp(value.starts_at),
    movie_title: text(value.movie_title), poster_url: text(value.poster_url), theater_name: text(value.theater_name), theater_location: text(value.theater_location), screen_name: text(value.screen_name),
  };
}

/** Corrupt storage is never silently replaced with an empty list on a write. */
export function parseMockBookings(raw: string | null): MockBooking[] {
  if (raw === null) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) throw new Error("Expected bookings array.");
    const bookings = value.map(parseBooking);
    const ids = new Set<string>();
    const numbers = new Set<string>();
    const assignments = new Set<string>();
    for (const booking of bookings) {
      if (ids.has(booking.id) || numbers.has(booking.booking_number)) throw new Error("Duplicate booking.");
      ids.add(booking.id); numbers.add(booking.booking_number);
      for (const seat of booking.seat_ids) {
        const key = `${booking.showtime_id}:${seat}`;
        if (assignments.has(key)) throw new Error("Seat booked more than once.");
        assignments.add(key);
      }
    }
    return bookings;
  } catch {
    throw new Error("Saved bookings could not be read. Your browser data was not changed. Restore valid booking data before confirming another booking.");
  }
}

export function readMockBookings(): MockBooking[] {
  let raw: string | null;
  try { raw = window.localStorage.getItem(MOCK_BOOKINGS_KEY); }
  catch { throw new Error("Browser storage is unavailable. Enable local storage to view or confirm bookings."); }
  return parseMockBookings(raw);
}

export function bookingStorageSnapshot(): string | null {
  try { return window.localStorage.getItem(MOCK_BOOKINGS_KEY); }
  catch { return BOOKING_STORAGE_UNAVAILABLE; }
}

export function subscribeMockBookings(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => { if (event.key === MOCK_BOOKINGS_KEY || event.key === null) listener(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(MOCK_BOOKINGS_CHANGED, listener);
  window.addEventListener("focus", listener);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(MOCK_BOOKINGS_CHANGED, listener); window.removeEventListener("focus", listener); };
}
