import { getPreviewSeats, type HomeContent, type HomeShow } from "@/features/home/services/home-content-utils";

/** Read-only demo availability. Missing inventory must never imply an available seat. */
export function getShowAvailability(content: HomeContent, show: HomeShow, at: Date) {
  const seats = getPreviewSeats(content, show, at);
  const physicalSeats = content.seats.filter((seat) => seat.screen_id === show.screen_id);
  const coordinates = new Set(physicalSeats.map((seat) => `${seat.row_index}:${seat.column_index}`));
  const complete = physicalSeats.length > 0 && physicalSeats.length === show.screen.capacity && seats.length === physicalSeats.length && coordinates.size === physicalSeats.length && physicalSeats.every((seat) => seat.row_index >= 0 && seat.row_index < show.screen.row_count && seat.column_index >= 0 && seat.column_index < show.screen.col_count);
  const available = seats.filter((seat) => !seat.reserved).length;
  const status = !show.is_active || Date.parse(show.starts_at) <= at.getTime() || !complete
    ? "UNAVAILABLE" : available > 0 ? "AVAILABLE" : seats.every((seat) => seat.status === "BOOKED") ? "SOLD_OUT" : "UNAVAILABLE";
  return { status, available, total: physicalSeats.length };
}

export function getMovieTheaterGroups(content: HomeContent, movieId: string, city: string, date: string, at: Date) {
  const shows = content.shows.filter((show) => show.movie_id === movieId && show.city === city && show.date === date && Date.parse(show.starts_at) > at.getTime())
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
  return [...new Set(shows.map((show) => show.theater.id))].flatMap((theaterId) => {
    const theaterShows = shows.filter((show) => show.theater.id === theaterId);
    const theater = theaterShows[0]?.theater;
    if (!theater) return [];
    return [{ theater, screens: [...new Set(theaterShows.map((show) => show.screen_id))].map((screenId) => ({
      screen: theaterShows.filter((show) => show.screen_id === screenId)[0].screen,
      shows: theaterShows.filter((show) => show.screen_id === screenId).map((show) => ({ show, availability: getShowAvailability(content, show, at) })),
    })) }];
  });
}
