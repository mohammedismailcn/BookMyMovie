import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

// Execute the existing TypeScript fixtures without adding a test runner or emitting app files.
const requireFromProject = createRequire(import.meta.url);
function createLoader() {
  const cache = new Map();
  return function load(file) {
    if (cache.has(file)) return cache.get(file);
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule.exports);
    const source = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename: file })((name) => name.startsWith("@/") ? load(path.resolve("src", `${name.slice(2)}.ts`)) : requireFromProject(name), loadedModule, loadedModule.exports);
    cache.set(file, loadedModule.exports);
    return loadedModule.exports;
  };
}
const load = createLoader();
const db = load(path.resolve("src/lib/mock-data.ts"));
const at = new Date(process.env.MOCK_VALIDATE_AT ?? db.MOCK_EVALUATED_AT);
assert.ok(Number.isFinite(at.getTime()), "Invalid evaluation date");
const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
const dateInIndia = (iso) => dateFormatter.format(new Date(iso));
const index = (rows, name, key = "id") => {
  const result = new Map(rows.map((row) => [row[key], row]));
  assert.equal(result.size, rows.length, `${name}: duplicate ${key}`);
  return result;
};
const tables = Object.fromEntries(Object.entries(db.mockData).map(([name, rows]) => [name, index(rows, name)]));
const { movies, theaters, screens, seats, showtimes, show_seats, users, bookings, booking_seats, payments } = db;
index(bookings, "bookings", "booking_number");
index(users, "users", "email");
index(payments, "payments", "provider_reference");
const groupBy = (rows, key) => {
  const grouped = new Map();
  for (const row of rows) { const values = grouped.get(row[key]) ?? []; values.push(row); grouped.set(row[key], values); }
  return grouped;
};
const physicalByScreen = groupBy(seats, "screen_id");
const inventoryByShow = groupBy(show_seats, "showtime_id");
const showsByScreen = groupBy(showtimes, "screen_id");
const assignmentsByBooking = groupBy(booking_seats, "booking_id");
const paymentsByBooking = groupBy(payments, "booking_id");
const cities = new Set(theaters.map((theater) => theater.location.split(",").at(-1).trim()));
assert.equal(movies.filter((movie) => movie.is_active).length, 30);
assert.equal(theaters.length, 20); assert.equal(screens.length, 45); assert.equal(cities.size, 8);
assert.ok(showtimes.length >= 500); assert.equal(bookings.length, 18);
for (const movie of movies) {
  assert.ok(movie.duration_minutes > 0 && Number.isFinite(Date.parse(movie.release_date)), movie.id);
  if (movie.poster_url.startsWith("/")) {
    assert.ok(existsSync(path.join("public", movie.poster_url)), `Missing local poster: ${movie.id}`);
  } else {
    const poster = new URL(movie.poster_url);
    const config = load(path.resolve("next.config.ts")).default;
    assert.ok(config.images.remotePatterns.some((pattern) => poster.protocol === `${pattern.protocol}:` && poster.hostname === pattern.hostname && poster.port === pattern.port && poster.pathname.startsWith(pattern.pathname.replace("**", "")) && poster.search === pattern.search), `Unconfigured remote poster: ${movie.id}`);
  }
  assert.ok(movie.description && movie.genre && movie.language);
  if (movie.is_active) {
    const movieShows = showtimes.filter((show) => show.movie_id === movie.id);
    assert.ok(movieShows.length >= 2, `Movie without multiple shows: ${movie.id}`);
    assert.ok(new Set(movieShows.map((show) => tables.screens.get(show.screen_id).theater_id)).size >= 2, `Movie without multiple theaters: ${movie.id}`);
    const dailyTheaterShows = new Map();
    for (const show of movieShows) {
      const key = `${tables.screens.get(show.screen_id).theater_id}:${dateInIndia(show.starts_at)}`;
      dailyTheaterShows.set(key, (dailyTheaterShows.get(key) ?? 0) + 1);
    }
    assert.ok([...dailyTheaterShows.values()].some((count) => count >= 2), `Movie without repeat daily theater showtimes: ${movie.id}`);
  }
}
index(screens.map((screen) => ({ id: `${screen.theater_id}:${screen.screen_number}` })), "theater screen numbers");
index(seats.map((seat) => ({ id: `${seat.screen_id}:${seat.row_index}:${seat.column_index}` })), "physical seat positions");
index(seats.map((seat) => ({ id: `${seat.screen_id}:${seat.row_label}:${seat.seat_number}` })), "physical seat labels");
for (const screen of screens) {
  assert.ok(tables.theaters.has(screen.theater_id), screen.id);
  assert.equal((physicalByScreen.get(screen.id) ?? []).length, screen.capacity, screen.id);
  assert.equal(screen.capacity, screen.row_count * screen.col_count);
  assert.ok(screen.screen_row_index >= 0 && screen.screen_row_index <= screen.row_count);
  assert.ok(screen.screen_center_columns.every((column) => column >= 0 && column < screen.col_count));
  assert.ok(screen.extra_legroom_after_rows.every((row) => row >= 0 && row < screen.row_count - 1));
  for (const point of [...screen.exit_positions, ...screen.speaker_positions, ...screen.accessible_positions]) {
    assert.ok(point.row_index >= 0 && point.row_index < screen.row_count && point.column_index >= 0 && point.column_index < screen.col_count, `Invalid screen point: ${screen.id}`);
  }
  const ordered = [...(showsByScreen.get(screen.id) ?? [])].sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
  for (let i = 1; i < ordered.length; i++) assert.ok(Date.parse(ordered[i - 1].ends_at) <= Date.parse(ordered[i].starts_at), `Overlapping shows: ${ordered[i - 1].id}, ${ordered[i].id}`);
}
for (const seat of seats) {
  const screen = tables.screens.get(seat.screen_id); assert.ok(screen, seat.id);
  assert.ok(seat.row_index >= 0 && seat.row_index < screen.row_count && seat.column_index >= 0 && seat.column_index < screen.col_count, seat.id);
}
const dates = [...new Set(showtimes.map((show) => dateInIndia(show.starts_at)))].sort();
assert.equal(dates.length, 14);
assert.equal(dates[0], "2026-11-07"); assert.equal(dates.at(-1), "2026-11-20");
for (const city of cities) for (const date of dates) {
  assert.ok(showtimes.some((show) => dateInIndia(show.starts_at) === date && tables.theaters.get(tables.screens.get(show.screen_id).theater_id).location.endsWith(`, ${city}`)), `Missing city/date: ${city}/${date}`);
}
index(show_seats.map((item) => ({ id: `${item.showtime_id}:${item.seat_id}` })), "show inventory pairs");
const occupancy = { nearlyEmpty: 0, moderate: 0, high: 0, soldOut: 0 };
for (const show of showtimes) {
  const movie = tables.movies.get(show.movie_id); const screen = tables.screens.get(show.screen_id);
  assert.ok(movie?.is_active && screen?.is_active, show.id);
  assert.equal(Date.parse(show.ends_at) - Date.parse(show.starts_at), (movie.duration_minutes + 20) * 60000, show.id);
  const inventory = inventoryByShow.get(show.id) ?? [];
  assert.equal(inventory.length, (physicalByScreen.get(screen.id) ?? []).length, `Incomplete inventory: ${show.id}`);
  const booked = inventory.filter((seat) => seat.status === "BOOKED").length;
  const ratio = booked / inventory.length;
  if (ratio < 0.15) occupancy.nearlyEmpty++;
  if (ratio >= 0.25 && ratio <= 0.65) occupancy.moderate++;
  if (ratio >= 0.7 && ratio < 1) occupancy.high++;
  if (ratio === 1) occupancy.soldOut++;
}
for (const inventory of show_seats) {
  const seat = tables.seats.get(inventory.seat_id); const show = tables.showtimes.get(inventory.showtime_id);
  assert.ok(seat && show && seat.screen_id === show.screen_id, inventory.id);
  assert.equal(inventory.id, `${show.id}-${seat.id}`);
  assert.ok(["AVAILABLE", "BOOKED", "HELD"].includes(inventory.status));
  if (inventory.status === "HELD") assert.ok(Date.parse(inventory.held_until) > at.getTime() && Date.parse(inventory.held_until) < Date.parse(show.starts_at), `Invalid hold: ${inventory.id}`);
  else assert.equal(inventory.held_until, null);
}
for (const value of Object.values(occupancy)) assert.ok(value > 0, "Missing occupancy scenario");
for (const assignment of booking_seats) {
  const booking = tables.bookings.get(assignment.booking_id); const inventory = tables.show_seats.get(assignment.show_seat_id);
  assert.ok(booking && inventory && booking.showtime_id === inventory.showtime_id, assignment.id);
  assert.equal(assignment.price_at_booking, inventory.price, `Price snapshot: ${assignment.id}`);
  if (booking.status === "CONFIRMED") assert.equal(inventory.status, "BOOKED", assignment.id);
  if (booking.status === "PENDING_PAYMENT") { assert.equal(inventory.status, "HELD"); assert.equal(inventory.held_until, booking.expires_at); }
  if (["CANCELLED", "EXPIRED"].includes(booking.status)) assert.equal(inventory.status, "AVAILABLE", `Unreleased cancellation: ${assignment.id}`);
}
const activeAssignments = booking_seats.filter((assignment) => ["CONFIRMED", "PENDING_PAYMENT"].includes(tables.bookings.get(assignment.booking_id).status));
index(activeAssignments, "active booking seat assignments", "show_seat_id");
for (const booking of bookings) {
  assert.ok(tables.users.has(booking.user_id) && tables.showtimes.has(booking.showtime_id), booking.id);
  const assignments = assignmentsByBooking.get(booking.id) ?? []; assert.ok(assignments.length > 0, booking.id);
  assert.equal(assignments.reduce((sum, item) => sum + item.price_at_booking, 0), booking.total_amount, `Total mismatch: ${booking.id}`);
  const attempts = paymentsByBooking.get(booking.id) ?? []; assert.ok(attempts.length > 0);
  if (booking.status === "CONFIRMED") assert.ok(attempts.some((payment) => payment.status === "SUCCESS" && payment.amount === booking.total_amount));
  if (booking.status === "PENDING_PAYMENT") { assert.ok(attempts.some((payment) => payment.status === "PENDING")); assert.ok(Date.parse(booking.expires_at) > at.getTime()); }
  if (booking.status === "EXPIRED") assert.ok(Date.parse(booking.expires_at) < at.getTime());
}
for (const payment of payments) { assert.ok(tables.bookings.has(payment.booking_id), payment.id); assert.equal(payment.amount, tables.bookings.get(payment.booking_id).total_amount); }
for (const [table, prefix, count] of [["movies", "m", 9], ["theaters", "t", 3], ["screens", "s", 6], ["showtimes", "sh", 10], ["bookings", "b", 3], ["payments", "p", 3], ["booking_seats", "bs", 6]]) {
  for (let i = 1; i <= count; i++) assert.ok(tables[table].has(`${prefix}${i}`), `Lost legacy ID ${prefix}${i}`);
}
assert.equal(tables.bookings.get("b1").showtime_id, "sh1"); assert.equal(tables.bookings.get("b2").showtime_id, "sh3"); assert.equal(tables.bookings.get("b3").showtime_id, "sh5");
assert.equal(tables.booking_seats.get("bs1").show_seat_id, "sh1-s1-A5");
const fingerprint = (data) => { const hash = createHash("sha256"); for (const rows of Object.values(data.mockData)) for (const row of rows) hash.update(JSON.stringify(row)); return hash.digest("hex"); };
assert.equal(fingerprint(db), fingerprint(createLoader()(path.resolve("src/lib/mock-data.ts"))), "Non-deterministic fixture generation");
const { getHomeContent } = load(path.resolve("src/features/home/services/home-content-service.ts"));
const { filterHomeShows, getPreviewSeats } = load(path.resolve("src/features/home/services/home-content-utils.ts"));
const { getShowAvailability } = load(path.resolve("src/features/showtimes/services/showtime-discovery.ts"));
const home = getHomeContent(at, { includeInventory: false });
assert.equal(home.dates.length, 7); assert.equal(home.dates[0].value,"2026-11-07"); assert.equal(home.dates.at(-1).value,"2026-11-13"); assert.equal(home.cities.length, 8); assert.equal(home.inventory.length, 0); assert.equal(home.seats.length, 0);
assert.ok(home.movies.every((movie) => movie.is_active));
for (const city of cities) for (const date of dates) assert.ok(filterHomeShows(home.shows, city, date, "").every((show) => show.city === city && show.date === date));
const detail = getHomeContent(at, { movieId: "m2" }); assert.ok(detail.shows.every((show) => show.movie_id === "m2"));
const legacy = detail.shows.find((show) => show.id === "sh2"); assert.ok(legacy);
assert.equal(getPreviewSeats(detail, legacy, at).length, tables.screens.get("s2").capacity);
const soldShow = showtimes.find((show) => (inventoryByShow.get(show.id) ?? []).every((seat) => seat.status === "BOOKED"));
const soldContent = getHomeContent(at, { showtimeId: soldShow.id });
assert.equal(getShowAvailability(soldContent, soldContent.shows.find((show) => show.id === soldShow.id), at).status, "SOLD_OUT");
assert.equal(filterHomeShows(home.shows, "Missing city", dates[0], "").length, 0);
const { getShowSeatStatus } = load(path.resolve("src/features/showtimes/services/show-seat-availability.ts"));
const held = show_seats.find((seat) => seat.status === "HELD");
assert.equal(getShowSeatStatus(held, new Date(Date.parse(held.held_until) + 1)), "AVAILABLE");
console.log("PASS: relationships, legacy IDs, schedule overlaps, all 14 dates/cities, inventory, bookings/payments, expiry, determinism and page filtering.");
console.log(JSON.stringify({ evaluatedAt: at.toISOString(), dates, counts: { movies: movies.length, activeMovies: 30, theaters: theaters.length, cities: cities.size, screens: screens.length, showtimes: showtimes.length, seats: seats.length, showSeats: show_seats.length, users: users.length, bookings: bookings.length, bookingSeats: booking_seats.length, payments: payments.length }, occupancy }, null, 2));

const {authDestination,showtimeSeatsRoute,movieTheatersRoute}=load(path.resolve("src/lib/constants/routes.ts"));
for(const destination of [showtimeSeatsRoute("sh1"),movieTheatersRoute("m1","Kochi","2026-11-07")])assert.equal(authDestination(destination),destination);
for(const destination of ["https://evil.example/","//evil.example/","/login","/movies/../login","/showtimes/x/seats/other"])assert.equal(authDestination(destination),"/profile");
console.log("PASS: seven-day visible booking window and safe post-login booking destinations.");
