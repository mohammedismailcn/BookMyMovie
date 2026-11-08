import { calculateSeatFeatures } from "@/features/recommendations/services/seat-feature-scores";
/**
 * BOOKMYMOVIE MOCK DATABASE - edit sample content in this file.
 *
 * Stable IDs connect movies -> showtimes -> screens -> theaters and bookings.
 * Keep referenced IDs unchanged when editing existing records. Dates use ISO strings.
 * Edit screen dimensions and showSeed below; seats, end times, and inventory regenerate.
 * Booking-seat price snapshots must still sum to their booking/payment totals.
 * Table feature mocks re-export these records. Homepage content and Auth seeds stay in their features.
 * Demo only: these short IDs are not database UUIDs and no real payments are made.
 */
import type { Movie } from "@/features/movies/types/movie-types";
import type { SeatType } from "@/features/seats/types/seat-types";
import type { ShowSeat } from "@/features/showtimes/types/show-seat-types";

export type { SeatType } from "@/features/seats/types/seat-types";
export type { ShowSeat, ShowSeatStatus } from "@/features/showtimes/types/show-seat-types";

// ========================================================================
// Movie catalog
// ========================================================================
// Demo fixtures only. Preserve IDs m1–m8 because existing fixtures reference them.
// Existing local posters are reused; other titles use the bundled generic placeholder.
// Comma-separated genres match the existing schema. m9 covers inactive-list filtering.
export const movies = [
  {
    id: "m1",
    title: "Manjummel Boys",
    description: "Friends attempt a daring rescue inside a deep cave.",
    poster_url: "/images/manjummel-boys.jpg",
    language: "Malayalam",
    genre: "Adventure, Thriller",
    duration_minutes: 135,
    release_date: "2024-02-22",
    is_active: true,
    created_at: "2026-11-01T09:00:00Z",
  },
  {
    id: "m2",
    title: "Aavesham",
    description: "College students cross paths with a flamboyant gangster.",
    poster_url: "/images/aavesham.jpg",
    language: "Malayalam",
    genre: "Action, Comedy",
    duration_minutes: 158,
    release_date: "2024-04-11",
    is_active: true,
    created_at: "2026-11-01T09:00:00Z",
  },
  {
    id: "m3",
    title: "Premalu",
    description: "A young man's romantic misadventures in Hyderabad.",
    poster_url: "/images/premalu.jpg",
    language: "Malayalam",
    genre: "Romance, Comedy",
    duration_minutes: 156,
    release_date: "2024-02-09",
    is_active: true,
    created_at: "2026-11-01T09:00:00Z",
  },
  {
    id: "m4",
    title: "2018",
    description: "Stories of courage during Kerala's devastating floods.",
    poster_url: "/assets/movie-placeholder.svg",
    language: "Malayalam",
    genre: "Drama, Thriller",
    duration_minutes: 150,
    release_date: "2023-05-05",
    is_active: true,
    created_at: "2026-11-01T09:00:00Z",
  },
  {
    id: "m5",
    title: "Vikram",
    description: "An investigator uncovers a dangerous criminal conspiracy.",
    poster_url: "/images/vikram.jpg",
    language: "Tamil",
    genre: "Action, Thriller",
    duration_minutes: 174,
    release_date: "2022-06-03",
    is_active: true,
    created_at: "2026-11-01T09:00:00Z",
  },
  {
    id: "m6",
    title: "Jailer",
    description: "A retired jailer confronts a dangerous network.",
    poster_url: "/assets/movie-placeholder.svg",
    language: "Tamil",
    genre: "Action, Drama",
    duration_minutes: 169,
    release_date: "2023-08-10",
    is_active: true,
    created_at: "2026-11-01T09:00:00Z",
  },
  {
    id: "m7",
    title: "12th Fail",
    description: "A determined student pursues his civil service dream.",
    poster_url: "/assets/movie-placeholder.svg",
    language: "Hindi",
    genre: "Drama",
    duration_minutes: 147,
    release_date: "2023-10-27",
    is_active: true,
    created_at: "2026-11-01T09:00:00Z",
  },
  {
    id: "m8",
    title: "Dune: Part Two",
    description: "Paul Atreides joins the Fremen on Arrakis.",
    poster_url: "/images/dune-two.jpg",
    language: "English",
    genre: "Sci-Fi, Adventure",
    duration_minutes: 166,
    release_date: "2024-03-01",
    is_active: true,
    created_at: "2026-11-01T09:00:00Z",
  },
  {
    id: "m9",
    title: "Inception",
    description: "A specialist who enters dreams accepts a risky mission to plant an idea, while memories of his past threaten the team.",
    poster_url: "/assets/movie-placeholder.svg",
    language: "English",
    genre: "Sci-Fi, Thriller",
    duration_minutes: 148,
    release_date: "2010-07-16",
    is_active: false,
    created_at: "2026-10-01T09:00:00Z",
  },
  {"id": "m10", "title": "Bramayugam", "description": "A wandering singer finds refuge in a mysterious ancestral house.", "poster_url": "/assets/movie-placeholder.svg", "language": "Malayalam", "genre": "Horror, Thriller", "duration_minutes": 139, "release_date": "2024-02-15", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m11", "title": "The Goat Life", "description": "A migrant worker struggles to survive and return home.", "poster_url": "/assets/movie-placeholder.svg", "language": "Malayalam", "genre": "Drama, Adventure", "duration_minutes": 173, "release_date": "2024-03-28", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m12", "title": "Bangalore Days", "description": "Three cousins discover friendship and independence in Bengaluru.", "poster_url": "/assets/movie-placeholder.svg", "language": "Malayalam", "genre": "Drama, Romance", "duration_minutes": 171, "release_date": "2014-05-30", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m13", "title": "Kumbalangi Nights", "description": "Four brothers navigate difficult relationships in a coastal village.", "poster_url": "/assets/movie-placeholder.svg", "language": "Malayalam", "genre": "Drama, Comedy", "duration_minutes": 135, "release_date": "2019-02-07", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m14", "title": "Leo", "description": "A cafe owner faces a violent past after protecting his family.", "poster_url": "/assets/movie-placeholder.svg", "language": "Tamil", "genre": "Action, Thriller", "duration_minutes": 164, "release_date": "2023-10-19", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m15", "title": "Ponniyin Selvan: I", "description": "A messenger becomes entangled in a struggle for the Chola throne.", "poster_url": "/assets/movie-placeholder.svg", "language": "Tamil", "genre": "Adventure, Drama", "duration_minutes": 167, "release_date": "2022-09-30", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m16", "title": "96", "description": "A school reunion brings two former sweethearts together.", "poster_url": "/assets/movie-placeholder.svg", "language": "Tamil", "genre": "Romance, Drama", "duration_minutes": 158, "release_date": "2018-10-04", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m17", "title": "Jawan", "description": "A vigilante challenges corruption while confronting his own past.", "poster_url": "/assets/movie-placeholder.svg", "language": "Hindi", "genre": "Action, Thriller", "duration_minutes": 169, "release_date": "2023-09-07", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m18", "title": "Stree 2", "description": "Friends confront a new supernatural threat in their small town.", "poster_url": "/assets/movie-placeholder.svg", "language": "Hindi", "genre": "Horror, Comedy", "duration_minutes": 149, "release_date": "2024-08-15", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m19", "title": "Dangal", "description": "A determined father trains his daughters to become wrestlers.", "poster_url": "/assets/movie-placeholder.svg", "language": "Hindi", "genre": "Drama, Sport", "duration_minutes": 161, "release_date": "2016-12-23", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m20", "title": "Queen", "description": "A young woman sets off alone on a transformative European journey.", "poster_url": "/assets/movie-placeholder.svg", "language": "Hindi", "genre": "Comedy, Drama", "duration_minutes": 146, "release_date": "2014-03-07", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m21", "title": "RRR", "description": "Two revolutionaries form an unlikely friendship under colonial rule.", "poster_url": "/assets/movie-placeholder.svg", "language": "Telugu", "genre": "Action, Adventure", "duration_minutes": 182, "release_date": "2022-03-25", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m22", "title": "Sita Ramam", "description": "Letters reveal the love story of a soldier and a mysterious woman.", "poster_url": "/assets/movie-placeholder.svg", "language": "Telugu", "genre": "Romance, Drama", "duration_minutes": 163, "release_date": "2022-08-05", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m23", "title": "Hanu-Man", "description": "A village youth gains extraordinary powers and protects his community.", "poster_url": "/assets/movie-placeholder.svg", "language": "Telugu", "genre": "Action, Fantasy", "duration_minutes": 158, "release_date": "2024-01-12", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m24", "title": "Jersey", "description": "A former cricketer attempts a comeback for the sake of his son.", "poster_url": "/assets/movie-placeholder.svg", "language": "Telugu", "genre": "Drama, Sport", "duration_minutes": 160, "release_date": "2019-04-19", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m25", "title": "Kantara", "description": "A forest community faces a conflict over land, tradition and identity.", "poster_url": "/assets/movie-placeholder.svg", "language": "Kannada", "genre": "Thriller, Drama", "duration_minutes": 148, "release_date": "2022-09-30", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m26", "title": "777 Charlie", "description": "A lonely factory worker finds companionship with an adventurous dog.", "poster_url": "/assets/movie-placeholder.svg", "language": "Kannada", "genre": "Adventure, Drama", "duration_minutes": 164, "release_date": "2022-06-10", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m27", "title": "KGF: Chapter 2", "description": "A powerful outlaw fights to protect his empire in the gold fields.", "poster_url": "/assets/movie-placeholder.svg", "language": "Kannada", "genre": "Action, Drama", "duration_minutes": 168, "release_date": "2022-04-14", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m28", "title": "Interstellar", "description": "Explorers travel through a wormhole in search of humanity's future.", "poster_url": "/images/interstellar.jpg", "language": "English", "genre": "Sci-Fi, Adventure", "duration_minutes": 169, "release_date": "2014-11-07", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m29", "title": "Inside Out 2", "description": "New emotions arrive as Riley begins navigating her teenage years.", "poster_url": "/assets/movie-placeholder.svg", "language": "English", "genre": "Animation, Comedy", "duration_minutes": 96, "release_date": "2024-06-14", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m30", "title": "The Wild Robot", "description": "A stranded robot learns to care for a young goose on a remote island.", "poster_url": "/assets/movie-placeholder.svg", "language": "English", "genre": "Animation, Adventure", "duration_minutes": 102, "release_date": "2024-09-27", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
  {"id": "m31", "title": "The Dark Knight", "description": "Batman faces a criminal mastermind who pushes Gotham into chaos.", "poster_url": "/assets/movie-placeholder.svg", "language": "English", "genre": "Action, Thriller", "duration_minutes": 152, "release_date": "2008-07-18", "is_active": true, "created_at": "2026-11-01T09:00:00Z"},
] as const satisfies readonly Movie[];

// ========================================================================
// Theaters
// ========================================================================
// Fictional demo venues and schedules; not verified real-world listings.
export const theaters = [
  { id: "t1", name: "Cochin Grand Cinemas", location: "Edappally, Kochi", created_at: "2026-01-10T09:00:00Z" },
  { id: "t2", name: "Harbor View Multiplex", location: "Marine Drive, Kochi", created_at: "2026-01-12T09:00:00Z" },
  { id: "t3", name: "Metro Screen House", location: "Kakkanad, Kochi", created_at: "2026-01-15T09:00:00Z" },
  {"id": "t4", "name": "Palace Square Cinemas", "location": "MG Road, Thrissur", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t5", "name": "Riverbank Picturehouse", "location": "Punkunnam, Thrissur", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t6", "name": "Round East Multiplex", "location": "East Fort, Thrissur", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t7", "name": "Malabar Coast Cinemas", "location": "Mavoor Road, Kozhikode", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t8", "name": "Beachfront Filmhouse", "location": "Vellayil, Kozhikode", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t9", "name": "Capital Lantern Cinemas", "location": "Thampanoor, Thiruvananthapuram", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t10", "name": "Technocity Screens", "location": "Kazhakkoottam, Thiruvananthapuram", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t11", "name": "Garden City Pictures", "location": "Koramangala, Bengaluru", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t12", "name": "Orion Lane Cinemas", "location": "Whitefield, Bengaluru", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t13", "name": "Lakeside Cineplex", "location": "Hebbal, Bengaluru", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t14", "name": "Marina Star Cinemas", "location": "Velachery, Chennai", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t15", "name": "Coromandel Screens", "location": "Anna Nagar, Chennai", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t16", "name": "Deccan Vista Cinemas", "location": "Gachibowli, Hyderabad", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t17", "name": "Pearl City Filmhouse", "location": "Banjara Hills, Hyderabad", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t18", "name": "Harbour Lights Multiplex", "location": "Andheri West, Mumbai", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t19", "name": "Silver Palm Cinemas", "location": "Powai, Mumbai", "created_at": "2026-01-15T09:00:00Z"},
  {"id": "t20", "name": "Monsoon Picturehouse", "location": "Dadar, Mumbai", "created_at": "2026-01-15T09:00:00Z"},
] as const;

// ========================================================================
// Screen layouts - configure each screen here (all coordinates are zero-based).
// Override any returned layout field on an individual screen to customize geometry,
// exits, speakers, screen position or legroom rows. Seating options control generated
// seat types and legroom; physical seats and show inventory derive from these records.
// ========================================================================
// Demo fixtures only. Short IDs are not database UUIDs.
const layout = (id: string, theater_id: string, screen_number: number, row_count: number, col_count: number, price: number, seating: { default_seat_type?: SeatType; premium_rows?: number[]; accessible_positions?: { row_index: number; column_index: number }[]; legroom_by_type?: Record<SeatType, number> } = {}) => ({
  id, theater_id, screen_number, name: `Screen ${screen_number}`, capacity: row_count * col_count, row_count, col_count,
  extra_legroom_after_rows: [2], screen_center_columns: [Math.floor((col_count - 1) / 2), Math.ceil((col_count - 1) / 2)],
  exit_positions: [{ name: "Left Exit", row_index: row_count - 1, column_index: 0 }, { name: "Right Exit", row_index: row_count - 1, column_index: col_count - 1 }],
  speaker_positions: [{ name: "Front Left", row_index: 0, column_index: 1 }, { name: "Front Right", row_index: 0, column_index: col_count - 2 }, { name: "Rear Center", row_index: row_count - 1, column_index: Math.floor(col_count / 2) }],
  default_seat_type: seating.default_seat_type ?? "STANDARD",
  premium_rows: seating.premium_rows ?? [row_count - 2, row_count - 1],
  accessible_positions: seating.accessible_positions ?? [{ row_index: row_count - 1, column_index: 0 }, { row_index: row_count - 1, column_index: col_count - 1 }],
  legroom_by_type: seating.legroom_by_type ?? { STANDARD: 80, PREMIUM: 95, RECLINER: 110, ACCESSIBLE: 80 },
  screen_row_index: 0, is_active: true, created_at: "2026-01-10T09:00:00Z", base_price: price
});
export const screens = [
  layout("s1", "t1", 1, 6, 10, 220), layout("s2", "t1", 2, 6, 8, 200),
  layout("s3", "t2", 1, 5, 10, 240), layout("s4", "t2", 2, 4, 8, 300, { default_seat_type: "RECLINER", premium_rows: [] }),
  layout("s5", "t3", 1, 6, 10, 210), layout("s6", "t3", 2, 6, 8, 190),
  layout("s7", "t4", 1, 8, 10, 210, { default_seat_type: "RECLINER", premium_rows: [] }),
  layout("s8", "t4", 2, 5, 12, 240),
  layout("s9", "t4", 3, 6, 8, 270),
  layout("s10", "t5", 1, 7, 10, 300),
  layout("s11", "t5", 2, 8, 12, 330),
  layout("s12", "t5", 3, 5, 8, 180),
  layout("s13", "t6", 1, 6, 10, 210),
  layout("s14", "t6", 2, 7, 12, 240, { default_seat_type: "RECLINER", premium_rows: [] }),
  layout("s15", "t6", 3, 8, 8, 270),
  layout("s16", "t7", 1, 5, 10, 300),
  layout("s17", "t7", 2, 6, 12, 330),
  layout("s18", "t7", 3, 7, 8, 180),
  layout("s19", "t8", 1, 8, 10, 210),
  layout("s20", "t8", 2, 5, 12, 240),
  layout("s21", "t8", 3, 6, 8, 270, { default_seat_type: "RECLINER", premium_rows: [] }),
  layout("s22", "t9", 1, 7, 10, 300),
  layout("s23", "t9", 2, 8, 12, 330),
  layout("s24", "t10", 1, 5, 8, 180),
  layout("s25", "t10", 2, 6, 10, 210),
  layout("s26", "t11", 1, 7, 12, 240),
  layout("s27", "t11", 2, 8, 8, 270),
  layout("s28", "t12", 1, 5, 10, 300, { default_seat_type: "RECLINER", premium_rows: [] }),
  layout("s29", "t12", 2, 6, 12, 330),
  layout("s30", "t13", 1, 7, 8, 180),
  layout("s31", "t13", 2, 8, 10, 210),
  layout("s32", "t14", 1, 5, 12, 240),
  layout("s33", "t14", 2, 6, 8, 270),
  layout("s34", "t15", 1, 7, 10, 300),
  layout("s35", "t15", 2, 8, 12, 330, { default_seat_type: "RECLINER", premium_rows: [] }),
  layout("s36", "t16", 1, 5, 8, 180),
  layout("s37", "t16", 2, 6, 10, 210),
  layout("s38", "t17", 1, 7, 12, 240),
  layout("s39", "t17", 2, 8, 8, 270),
  layout("s40", "t18", 1, 5, 10, 300),
  layout("s41", "t18", 2, 6, 12, 330),
  layout("s42", "t19", 1, 7, 8, 180, { default_seat_type: "RECLINER", premium_rows: [] }),
  layout("s43", "t19", 2, 8, 10, 210),
  layout("s44", "t20", 1, 5, 12, 240),
  layout("s45", "t20", 2, 6, 8, 270),
] as const;

// ========================================================================
// Physical seats - generated from screen layouts
// ========================================================================
// Demo fixtures only. Short IDs are not database UUIDs.
function rowLabel(index: number): string {
  let label = "";
  for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) label = String.fromCharCode(65 + (value - 1) % 26) + label;
  return label;
}
export const seats = screens.flatMap(s => Array.from({ length: s.row_count * s.col_count }, (_, i) => {
  const row = Math.floor(i / s.col_count), col = i % s.col_count;
  const features = calculateSeatFeatures(s, { row_index: row, column_index: col });
  const type: SeatType = s.accessible_positions.some((position) => position.row_index === row && position.column_index === col) ? "ACCESSIBLE" : s.premium_rows.includes(row) ? "PREMIUM" : s.default_seat_type;
  return { id: `${s.id}-${rowLabel(row)}${col + 1}`, screen_id: s.id, row_label: rowLabel(row), seat_number: col + 1, row_index: row, column_index: col, seat_type: type, legroom_cm: s.legroom_by_type[type], view_score: features.view, sound_score: features.sound ?? 50, quiet_score: features.quiet ?? 50 };
}));

// ========================================================================
// Showtime inputs - edit showSeed; end times include a 20 minute turnaround
// ========================================================================
// Demo fixtures only. Short IDs are not database UUIDs.
const durationByMovie = new Map<string, number>(movies.map(m => [m.id, m.duration_minutes]));
function getDuration(movieId: string): number {
  const duration = durationByMovie.get(movieId);
  if (duration === undefined) throw new Error(`Unknown mock movie: ${movieId}`);
  return duration;
}
const showSeed = [
  ["sh1", "m1", "s1", "2026-11-07T10:30:00Z", 220], ["sh2", "m2", "s2", "2026-11-07T14:00:00Z", 200],
  ["sh3", "m3", "s3", "2026-11-07T11:00:00Z", 240], ["sh4", "m4", "s4", "2026-11-07T18:00:00Z", 300],
  ["sh5", "m5", "s5", "2026-11-07T10:00:00Z", 210], ["sh6", "m6", "s6", "2026-11-07T15:00:00Z", 190],
  ["sh7", "m7", "s1", "2026-11-08T15:30:00Z", 220], ["sh8", "m8", "s2", "2026-11-08T18:30:00Z", 200],
  ["sh9", "m2", "s3", "2026-11-08T16:00:00Z", 240], ["sh10", "m3", "s5", "2026-11-08T13:00:00Z", 210],
] as const;
const preservedShowtimes = showSeed.map(([id, movie_id, screen_id, starts_at, base_price]) => ({ id, movie_id, screen_id, starts_at, ends_at: new Date(Date.parse(starts_at) + (getDuration(movie_id) + 20) * 60000).toISOString(), base_price, is_active: true, created_at: "2026-11-01T09:00:00Z" }));

export const MOCK_SCHEDULE_START = "2026-11-07";
export const MOCK_SCHEDULE_DAYS = 14;
// Fixed dates make fixture generation reproducible. Availability is evaluated against the caller's clock.
export const MOCK_EVALUATED_AT = "2026-11-06T09:30:00Z";
const activeMovies = movies.filter((movie) => movie.is_active);
const localLanguages: Record<string, readonly string[]> = {
  Kochi: ["Malayalam", "Tamil"], Thrissur: ["Malayalam", "Tamil"], Kozhikode: ["Malayalam", "Tamil"],
  Thiruvananthapuram: ["Malayalam", "Tamil"], Bengaluru: ["Kannada", "Telugu", "Tamil"],
  Chennai: ["Tamil", "Telugu"], Hyderabad: ["Telugu", "Hindi"], Mumbai: ["Hindi"],
};
const generatedShowtimes = screens.flatMap((screen, screenIndex) => {
  const theater = theaters.find((item) => item.id === screen.theater_id);
  if (!theater) throw new Error(`Unknown theater for ${screen.id}`);
  const city = theater.location.split(",").at(-1)?.trim() ?? "";
  const pool = activeMovies.filter((movie) => ["English", "Hindi", ...(localLanguages[city] ?? [])].includes(movie.language));
  return Array.from({ length: MOCK_SCHEDULE_DAYS }, (_, day) => {
    const date = new Date(Date.parse(`${MOCK_SCHEDULE_START}T00:00:00Z`) + day * 86400000).toISOString().slice(0, 10);
    return [9, 13, 17, 21].flatMap((hour, slot) => {
      const movie = pool[(screenIndex * 5 + day * 3 + slot * 7) % pool.length];
      const starts_at = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00+05:30`).toISOString();
      const ends_at = new Date(Date.parse(starts_at) + (movie.duration_minutes + 20) * 60000).toISOString();
      if (preservedShowtimes.some((show) => show.screen_id === screen.id && Date.parse(starts_at) < Date.parse(show.ends_at) && Date.parse(ends_at) > Date.parse(show.starts_at))) return [];
      return [{ id: `sh-${screen.id}-${date.replaceAll("-", "")}-${hour}`, movie_id: movie.id, screen_id: screen.id, starts_at, ends_at,
        base_price: screen.base_price + (slot >= 2 ? 30 : 0) + ([0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay()) ? 20 : 0),
        is_active: true, created_at: "2026-11-01T09:00:00Z" }];
    });
  }).flat();
});
export const showtimes = [...preservedShowtimes, ...generatedShowtimes];

// ========================================================================
// Booking reference users - not login accounts
// ========================================================================
// Demo fixtures only. Short IDs are not database UUIDs.
// Reference profiles only; these users have no login credentials.
export const users = [
  { id: "u1", name: "Ananya Menon", email: "ananya@example.com", created_at: "2026-10-01T09:00:00Z" },
  { id: "u2", name: "Rahul Nair", email: "rahul@example.com", created_at: "2026-10-03T09:00:00Z" },
  { id: "u3", name: "Akhil Varma", email: "akhil@example.com", created_at: "2026-10-05T09:00:00Z" },
  { id: "u4", name: "Diya Thomas", email: "diya@example.com", created_at: "2026-10-07T09:00:00Z" },
  { id: "u5", name: "Nikhil Kumar", email: "nikhil@example.com", created_at: "2026-10-09T09:00:00Z" },
] as const;

// ========================================================================
// Bookings
// ========================================================================
// Demo fixtures only. Short IDs are not database UUIDs.
const originalBookings = [
  { id: "b1", booking_number: "BMM-2026-0001", showtime_id: "sh1", user_id: "u1", customer_name: "Ananya Menon", customer_email: "ananya@example.com", status: "CONFIRMED", total_amount: 440, expires_at: null, created_at: "2026-11-02T10:00:00Z", updated_at: "2026-11-02T10:01:00Z" },
  { id: "b2", booking_number: "BMM-2026-0002", showtime_id: "sh3", user_id: "u2", customer_name: "Rahul Nair", customer_email: "rahul@example.com", status: "CONFIRMED", total_amount: 480, expires_at: null, created_at: "2026-11-03T11:00:00Z", updated_at: "2026-11-03T11:01:00Z" },
  { id: "b3", booking_number: "BMM-2026-0003", showtime_id: "sh5", user_id: "u3", customer_name: "Akhil Varma", customer_email: "akhil@example.com", status: "PENDING_PAYMENT", total_amount: 420, expires_at: "2026-11-07T09:50:00Z", created_at: "2026-11-06T09:30:00Z", updated_at: "2026-11-06T09:30:00Z" },
] as const;

// ========================================================================
// Booking seat assignments and price snapshots
// ========================================================================
// Demo fixtures only. Short IDs are not database UUIDs.
// Price snapshots sum to the owning booking total.
const originalBookingSeats = [
  { id: "bs1", booking_id: "b1", show_seat_id: "sh1-s1-A5", price_at_booking: 220 },
  { id: "bs2", booking_id: "b1", show_seat_id: "sh1-s1-A6", price_at_booking: 220 },
  { id: "bs3", booking_id: "b2", show_seat_id: "sh3-s3-B5", price_at_booking: 240 },
  { id: "bs4", booking_id: "b2", show_seat_id: "sh3-s3-B6", price_at_booking: 240 },
  { id: "bs5", booking_id: "b3", show_seat_id: "sh5-s5-C5", price_at_booking: 210 },
  { id: "bs6", booking_id: "b3", show_seat_id: "sh5-s5-C6", price_at_booking: 210 },
] as const;

// ========================================================================
// Mock payments
// ========================================================================
// Demo fixtures only. Short IDs are not database UUIDs.
const originalPayments = [
  { id: "p1", booking_id: "b1", provider: "MOCK", provider_reference: "MOCK-PAY-001", status: "SUCCESS", amount: 440, currency: "INR", created_at: "2026-11-02T10:01:00Z", updated_at: "2026-11-02T10:01:00Z" },
  { id: "p2", booking_id: "b2", provider: "MOCK", provider_reference: "MOCK-PAY-002", status: "SUCCESS", amount: 480, currency: "INR", created_at: "2026-11-03T11:01:00Z", updated_at: "2026-11-03T11:01:00Z" },
  { id: "p3", booking_id: "b3", provider: "MOCK", provider_reference: "MOCK-PAY-003", status: "PENDING", amount: 420, currency: "INR", created_at: "2026-11-06T09:30:00Z", updated_at: "2026-11-06T09:30:00Z" },
] as const;

// ========================================================================
// Additional booking fixtures (reference users only; Auth remains unchanged).
// ========================================================================
type BookingStatus = "CONFIRMED" | "PENDING_PAYMENT" | "CANCELLED" | "EXPIRED";
type BookingFixture = {
  id: string; booking_number: string; showtime_id: string; user_id: string; customer_name: string; customer_email: string;
  status: BookingStatus; total_amount: number; expires_at: string | null; created_at: string; updated_at: string;
};
const seatsByScreen = new Map(screens.map((screen) => [screen.id, seats.filter((seat) => seat.screen_id === screen.id)]));
function seatPrice(base: number, type: SeatType): number {
  return base + (type === "PREMIUM" ? 50 : type === "RECLINER" ? 120 : 0);
}
const extraBookingFixtures = Array.from({ length: 57 }, (_, index) => {
  const number = index + 4;
  const show = generatedShowtimes[(index * 29) % generatedShowtimes.length];
  const user = users[index % users.length];
  const physical = seatsByScreen.get(show.screen_id);
  if (!physical) throw new Error(`Missing seats for ${show.id}`);
  const chosen = physical.slice(2 + index % 5, 4 + index % 5 + index % 3);
  const statuses: readonly BookingStatus[] = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING_PAYMENT", "CANCELLED", "EXPIRED"];
  const status = statuses[index % statuses.length];
  const assignments = chosen.map((seat, seatIndex) => ({ id: `bs-b${number}-${seatIndex + 1}`, booking_id: `b${number}`, show_seat_id: `${show.id}-${seat.id}`, price_at_booking: seatPrice(show.base_price, seat.seat_type) }));
  const booking: BookingFixture = { id: `b${number}`, booking_number: `BMM-2026-${String(number).padStart(4, "0")}`,
    showtime_id: show.id, user_id: user.id, customer_name: user.name, customer_email: user.email, status,
    total_amount: assignments.reduce((sum, item) => sum + item.price_at_booking, 0),
    expires_at: status === "PENDING_PAYMENT" ? new Date(Date.parse(show.starts_at) - 10 * 60000).toISOString() : status === "EXPIRED" ? "2026-11-05T10:00:00Z" : null,
    created_at: "2026-11-01T10:00:00Z", updated_at: status === "EXPIRED" ? "2026-11-05T10:00:00Z" : "2026-11-01T10:01:00Z" };
  const payment = { id: `p${number}`, booking_id: booking.id, provider: "MOCK", provider_reference: `MOCK-PAY-${String(number).padStart(3, "0")}`,
    status: status === "CONFIRMED" ? "SUCCESS" : status === "PENDING_PAYMENT" ? "PENDING" : "FAILED",
    amount: booking.total_amount, currency: "INR", created_at: booking.created_at, updated_at: booking.updated_at };
  return { booking, assignments, payment };
});
const activeBookingFixtures = extraBookingFixtures.slice(0, 15);
// Older browser exports may still contain these sample bookings.
export const legacyBookingSeatIds = extraBookingFixtures.flatMap(item => item.assignments.map(assignment => assignment.show_seat_id));
export const bookings: readonly BookingFixture[] = [...originalBookings, ...activeBookingFixtures.map((item) => item.booking)];
export const booking_seats = [...originalBookingSeats, ...activeBookingFixtures.flatMap((item) => item.assignments)];
export const payments = [...originalPayments, ...activeBookingFixtures.map((item) => item.payment)];

// ========================================================================
// Mostly light occupancy, with rare busy and sold-out examples.
// Holds expire before their show; never randomize on render or import.
// ========================================================================
function stableHash(value: string): number {
  return Array.from(value).reduce((hash, character) => (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0, 7);
}
const bookingById = new Map(bookings.map((booking) => [booking.id, booking]));
const assignmentByInventory = new Map(booking_seats.map((assignment) => [assignment.show_seat_id, assignment]));
const legacyAssignments = new Set(legacyBookingSeatIds);
export const show_seats: ShowSeat[] = showtimes.flatMap((show) => {
  const profile = stableHash(show.id) % 100;
  const occupancy = profile === 0 ? 100 : profile === 1 ? 75 : profile < 30 ? 5 : profile < 70 ? 15 : 30;
  return (seatsByScreen.get(show.screen_id) ?? []).map((seat) => {
    const id = `${show.id}-${seat.id}`;
    const roll = stableHash(id) % 100;
    let status: ShowSeat["status"] = roll < occupancy ? "BOOKED" : roll < Math.min(100, occupancy + 1) ? "HELD" : "AVAILABLE";
    let held_until: string | null = status === "HELD" ? new Date(Date.parse(show.starts_at) - 15 * 60000).toISOString() : null;
    if (legacyAssignments.has(id)) { status = "AVAILABLE"; held_until = null; }
    const assignment = assignmentByInventory.get(id);
    if (assignment) {
      const booking = bookingById.get(assignment.booking_id);
      if (!booking || booking.showtime_id !== show.id) throw new Error(`Invalid mock booking assignment: ${assignment.id}`);
      status = booking.status === "CONFIRMED" ? "BOOKED" : booking.status === "PENDING_PAYMENT" ? "HELD" : "AVAILABLE";
      held_until = status === "HELD" ? booking.expires_at : null;
    }
    return { id, showtime_id: show.id, seat_id: seat.id, status, price: seatPrice(show.base_price, seat.seat_type), held_until, created_at: "2026-11-01T09:00:00Z" };
  });
});

export const mockData = { movies, theaters, screens, seats, showtimes, show_seats, users, bookings, booking_seats, payments };
