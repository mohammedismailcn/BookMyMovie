import { localShowDate } from "@/features/home/services/home-content-utils";
import { DEFAULT_MOCK_DATABASE, type MockDatabase } from "@/features/mock-data/types/mock-database";
import { buildMockInventory } from "@/features/mock-data/services/mock-inventory";
import { resolveShowSeatAvailability } from "@/features/showtimes/services/show-seat-availability";

/** Join the supplied browser dataset, or default fixtures for server previews. Never authorizes a booking. */
export function getHomeContent(now: Date, scope: { movieId?: string; showtimeId?: string; includeInventory?: boolean } = {}, database: MockDatabase = DEFAULT_MOCK_DATABASE) {
  const { movies, theaters, screens, seats, showtimes } = database;
  const movieId = scope.movieId ?? (scope.showtimeId ? showtimes.find((show) => show.id === scope.showtimeId)?.movie_id : undefined);
  const futureShows = showtimes.filter((show) => show.is_active && Date.parse(show.starts_at) > now.getTime());
  const firstStart = Math.min(...futureShows.map((show) => Date.parse(show.starts_at)));
  const firstDate = Number.isFinite(firstStart) ? localShowDate(new Date(firstStart).toISOString()) : localShowDate(now.toISOString());
  const windowEnd = new Date(Date.parse(`${firstDate}T00:00:00+05:30`) + 7 * 86400000).getTime();
  const activeMovies = movies.filter((movie) => movie.is_active);
  const shows = showtimes.filter((show) => show.is_active && (!movieId || show.movie_id === movieId) && Date.parse(show.starts_at) > now.getTime() && Date.parse(show.starts_at) < windowEnd).flatMap((show) => {
    const movie = activeMovies.find((movie) => movie.id === show.movie_id);
    const screen = screens.find((screen) => screen.id === show.screen_id && screen.is_active);
    const theater = theaters.find((theater) => theater.id === screen?.theater_id);
    if (!movie || !screen || !theater) return [];
    return [{ ...show, movie, screen, theater, city: theater.location.split(",").at(-1)?.trim() ?? theater.location, date: localShowDate(show.starts_at) }];
  }).sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
  const cities = [...new Set(theaters.map((theater) => theater.location.split(",").at(-1)?.trim() ?? theater.location))];
  const dates = [...new Set(shows.map((show) => show.date))].map((value) => ({
    value,
    weekday: new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short" }).format(new Date(`${value}T12:00:00+05:30`)),
    label: new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00+05:30`)),
  }));
  const showIds = new Set(shows.map((show) => show.id));
  const screenIds = new Set(shows.map((show) => show.screen_id));
  return {
    asOf: now.toISOString(),
    movies: activeMovies,
    featuredMovies: activeMovies.filter((movie) => shows.some((show) => show.movie_id === movie.id)).slice(0, 5),
    theaters: theaters.map((theater) => ({ ...theater, city: theater.location.split(",").at(-1)?.trim() ?? theater.location,
      screenCount: screens.filter((screen) => screen.theater_id === theater.id && screen.is_active).length,
      capacity: seats.filter((seat) => screens.some((screen) => screen.id === seat.screen_id && screen.theater_id === theater.id && screen.is_active)).length,
    })),
    shows, cities, dates,
    inventory: scope.includeInventory === false ? [] : resolveShowSeatAvailability(buildMockInventory(database, showIds), now),
    seats: scope.includeInventory === false ? [] : seats.filter((seat) => screenIds.has(seat.screen_id)),
  };
}
export type HomeContent = ReturnType<typeof getHomeContent>;
export type HomeShow = HomeContent["shows"][number];

export { filterHomeShows, getPreviewSeats, localShowDate } from "@/features/home/services/home-content-utils";
export type { PreviewSeat } from "@/features/home/services/home-content-utils";
