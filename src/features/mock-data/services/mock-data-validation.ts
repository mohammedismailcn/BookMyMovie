import { DEFAULT_MOCK_DATABASE, TABLES, type MockDatabase } from "@/features/mock-data/types/mock-database";
import { parseMockBookings } from "@/features/bookings/services/booking-validation";
import { buildMockInventory } from "@/features/mock-data/services/mock-inventory";

export function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
function fail(message: string): never { throw new Error(message); }
function check(condition: unknown, message: string): asserts condition { if (!condition) fail(message); }
function shape(template: unknown, value: unknown, path: string): void {
  if (Array.isArray(template)) {
    check(Array.isArray(value), `${path} must be an array.`);
    check(value.length <= 20000, `${path} is too large.`);
    value.forEach((item, index) => shape(template[0], item, `${path}[${index}]`));
  } else if (object(template)) {
    check(object(value), `${path} must be an object.`);
    check(Object.keys(value).every(key => key in template), `${path} contains unknown fields.`);
    Object.entries(template).forEach(([key, sample]) => shape(sample, value[key], `${path}.${key}`));
  } else {
    check(typeof value === typeof template, `${path} must be ${typeof template}.`);
    if (typeof value === "number") {
      check(Number.isFinite(value) && value >= 0, `${path} must be a finite non-negative number.`);
      if (path.endsWith("base_price") || path.endsWith(".price") || path.endsWith("total_amount")) check(Math.abs(value*100-Math.round(value*100)) < 0.00001, `${path} must have at most two decimal places.`);
    }
    if (typeof value === "string") {
      check(value.length <= 10000 && (path.endsWith(".description") || value.trim().length > 0), `${path} is required or too long.`);
      if (path.endsWith("_at")) check(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(`${value.slice(0,10)}T00:00:00Z`).toISOString().slice(0,10) === value.slice(0,10), `${path} must be an ISO date/time with a valid date and timezone.`);
      if (path.endsWith(".release_date")) check(Number.isFinite(Date.parse(value)), `${path} must be a valid date.`);
    }
  }
}
function assertShape(value: unknown): asserts value is MockDatabase {
  check(object(value), "Expected a database object.");
  check(Object.keys(value).every(key => TABLES.some(table => table === key)), "Unknown database table.");
  for (const table of TABLES) shape([DEFAULT_MOCK_DATABASE[table][0]], value[table], table);
}
function unique(values: readonly string[], label: string): void { check(new Set(values).size === values.length, `Duplicate ${label}.`); }
const types = ["STANDARD", "PREMIUM", "RECLINER", "ACCESSIBLE"];
export function validateMockDatabase(value: unknown): MockDatabase {
  assertShape(value);
  for (const table of TABLES) {
    unique(value[table].map(item => item.id), `${table} IDs`);
    value[table].forEach(item => check(/^[a-zA-Z0-9-]{1,100}$/.test(item.id), `${table}: IDs must use letters, digits or hyphens (max 100).`));
  }
  const movies = new Map(value.movies.map(item => [item.id, item]));
  const theaters = new Set(value.theaters.map(item => item.id));
  const screens = new Map(value.screens.map(item => [item.id, item]));
  const shows = new Map(value.showtimes.map(item => [item.id, item]));
  const seats = new Map(value.seats.map(item => [item.id, item]));
  const users = new Set(value.users.map(item => item.id));
  value.movies.forEach(movie => {
    check(Number.isInteger(movie.duration_minutes) && movie.duration_minutes > 0 && movie.duration_minutes <= 600, `${movie.id}: duration must be 1–600 minutes.`);
    check(/^\d{4}-\d{2}-\d{2}$/.test(movie.release_date) && new Date(movie.release_date).toISOString().slice(0, 10) === movie.release_date, `${movie.id}: invalid release date.`);
    check((movie.poster_url.startsWith("/") && !movie.poster_url.startsWith("//") && !movie.poster_url.includes("\\")) || /^https:\/\/image\.pollinations\.ai\/prompt\/[^?]+$/.test(movie.poster_url), `${movie.id}: use a local poster path or a supported image.pollinations.ai/prompt URL.`);
  });
  unique(value.users.map(item => item.email.toLowerCase()), "user emails");
  value.users.forEach(user => check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email), `${user.id}: invalid email.`));
  unique(value.screens.map(item => `${item.theater_id}:${item.screen_number}`), "screen numbers within a theater");
  for (const screen of value.screens) {
    check(theaters.has(screen.theater_id), `${screen.id}: theater does not exist.`);
    check([screen.row_count, screen.col_count, screen.screen_number].every(n => Number.isInteger(n) && n > 0 && n <= 100), `${screen.id}: dimensions and screen number must be integers 1–100.`);
    check(Number.isInteger(screen.screen_row_index) && screen.screen_row_index <= screen.row_count, `${screen.id}: invalid screen row.`);
    check(screen.capacity === value.seats.filter(seat => seat.screen_id === screen.id).length, `${screen.id}: capacity must match its physical seats.`);
    check(screen.screen_center_columns.length > 0 && screen.screen_center_columns.every(n => Number.isInteger(n) && n < screen.col_count), `${screen.id}: invalid center columns.`);
    check(screen.extra_legroom_after_rows.every(n => Number.isInteger(n) && n < screen.row_count), `${screen.id}: invalid legroom rows.`);
    check(types.includes(screen.default_seat_type) && screen.premium_rows.every(n => Number.isInteger(n) && n < screen.row_count), `${screen.id}: invalid seating configuration.`);
    for (const point of [...screen.exit_positions, ...screen.speaker_positions, ...screen.accessible_positions]) check(Number.isInteger(point.row_index) && Number.isInteger(point.column_index) && point.row_index < screen.row_count && point.column_index < screen.col_count, `${screen.id}: layout point is outside screen dimensions.`);
  }
  unique(value.seats.map(item => `${item.screen_id}:${item.row_index}:${item.column_index}`), "seat coordinates");
  unique(value.seats.map(item => `${item.screen_id}:${item.row_label}:${item.seat_number}`), "seat labels");
  for (const seat of value.seats) {
    const screen = screens.get(seat.screen_id);
    check(screen && Number.isInteger(seat.row_index) && Number.isInteger(seat.column_index) && seat.row_index < screen.row_count && seat.column_index < screen.col_count, `${seat.id}: invalid screen or seat coordinates.`);
    check(Number.isInteger(seat.seat_number) && seat.seat_number > 0 && types.includes(seat.seat_type) && seat.legroom_cm > 0, `${seat.id}: invalid seat number, type or legroom.`);
    check([seat.view_score, seat.sound_score, seat.quiet_score].every(n => n <= 100), `${seat.id}: scores must be 0–100.`);
  }
  const byScreen = new Map<string, MockDatabase["showtimes"]>();
  for (const show of value.showtimes) {
    const movie = movies.get(show.movie_id);
    check(movie && screens.has(show.screen_id), `${show.id}: movie or screen does not exist.`);
    check(Date.parse(show.ends_at) >= Date.parse(show.starts_at) + movie.duration_minutes * 60000, `${show.id}: end must include the full movie duration.`);
    if (show.is_active) byScreen.set(show.screen_id, [...(byScreen.get(show.screen_id) ?? []), show]);
  }
  for (const shows of byScreen.values()) {
    const sorted = [...shows].sort((a,b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
    sorted.forEach((show,index) => check(index === 0 || Date.parse(show.starts_at) >= Date.parse(sorted[index - 1].ends_at), `${show.id}: overlapping showtimes on the same screen.`));
  }
  parseMockBookings(JSON.stringify(value.bookings));
  const baseline = new Map(buildMockInventory({ ...value, bookings: [] }, new Set(value.bookings.filter(b => b.status === "CONFIRMED").map(b => b.showtime_id))).map(item => [`${item.showtime_id}:${item.seat_id}`, item]));
  for (const booking of value.bookings) {
    const show = shows.get(booking.showtime_id);
    const screen = show && screens.get(show.screen_id);
    check(show && screen && users.has(booking.user_id) && booking.movie_id === show.movie_id && booking.screen_id === screen.id && booking.theater_id === screen.theater_id, `${booking.id}: invalid user, showtime, movie, screen or theater reference.`);
    check(booking.seat_ids.every(id => seats.get(id)?.screen_id === screen.id), `${booking.id}: seats must belong to the show's screen.`);
    if (booking.status === "CONFIRMED") check(booking.seat_ids.every(id => {
      const seat = baseline.get(`${show.id}:${id}`);
      return seat && seat.status !== "BOOKED" && (seat.status !== "HELD" || !seat.held_until || Date.parse(seat.held_until) <= Date.now());
    }), `${booking.id}: seat conflicts with independent seeded occupancy.`);
  }
  return value;
}
