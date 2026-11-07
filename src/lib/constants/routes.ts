export const ROUTES = {
  mockData: "/dev/mock-data",
  home: "/", login: "/login", signup: "/signup", forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  profile: "/profile", myBookings: "/my-bookings", bookings: "/bookings", checkout: "/checkout",
  movies: "/movies", theaters: "/theaters", offers: "/offers", search: "/search",
} as const;

export function loginRoute(returnTo: string): string {
  return `${ROUTES.login}?next=${encodeURIComponent(returnTo)}`;
}

export function authDestination(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return ROUTES.profile;
  const target = new URL(value, "https://bookmymovie.invalid");
  const staticRoutes: readonly string[] = [ROUTES.profile, ROUTES.myBookings, ROUTES.bookings, ROUTES.movies];
  const bookingPage = /^\/bookings\/[a-zA-Z0-9-]+\/success$/.test(target.pathname) || /^\/movies\/[a-zA-Z0-9-]+\/theaters$/.test(target.pathname) || /^\/showtimes\/[a-zA-Z0-9-]+\/seats$/.test(target.pathname);
  return target.origin === "https://bookmymovie.invalid" && (staticRoutes.includes(target.pathname) || bookingPage) ? `${target.pathname}${target.search}${target.hash}` : ROUTES.profile;
}

export function signupRoute(returnTo: string): string {
  return `${ROUTES.signup}?next=${encodeURIComponent(authDestination(returnTo))}`;
}

export function isProtectedAuthRoute(pathname: string): boolean {
  return /^\/showtimes\/[a-zA-Z0-9-]+\/seats$/.test(pathname) || [ROUTES.profile, ROUTES.myBookings, ROUTES.bookings, ROUTES.resetPassword]
    .some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function movieTheatersRoute(movieId: string, city?: string, date?: string): string {
  const query = new URLSearchParams();
  if (city) query.set("city", city);
  if (date) query.set("date", date);
  const suffix = query.toString();
  return `${ROUTES.movies}/${encodeURIComponent(movieId)}/theaters${suffix ? `?${suffix}` : ""}`;
}

export function showtimeSeatsRoute(showtimeId: string): string {
  return `/showtimes/${encodeURIComponent(showtimeId)}/seats`;
}

export function isMovieTheatersRoute(pathname: string): boolean {
  return /^\/movies\/[a-zA-Z0-9-]+\/theaters$/.test(pathname);
}

export function isShowtimeSeatsRoute(pathname: string): boolean {
  return /^\/showtimes\/[a-zA-Z0-9-]+\/seats$/.test(pathname);
}

export function moviesRoute(city: string, date: string, query = ""): string {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (date) params.set("date", date);
  if (query.trim()) params.set("q", query.trim());
  return `${ROUTES.movies}${params.size ? `?${params}` : ""}`;
}

export function isBookingDestination(value: string): boolean {
  const pathname = new URL(authDestination(value), "https://bookmymovie.invalid").pathname;
  return /^\/bookings\/[a-zA-Z0-9-]+\/success$/.test(pathname) || /^\/movies\/[a-zA-Z0-9-]+\/theaters$/.test(pathname) || /^\/showtimes\/[a-zA-Z0-9-]+\/seats$/.test(pathname) || pathname === ROUTES.bookings || pathname === ROUTES.checkout;
}

export function bookingSuccessRoute(bookingId: string): string {
  return `${ROUTES.bookings}/${encodeURIComponent(bookingId)}/success`;
}
