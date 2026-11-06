# BookMyMovie

Next.js App Router starter with TypeScript, Tailwind CSS, and shadcn/ui.

## Development

Use Node.js 22 LTS or newer and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Edit `src/app/page.tsx` to start building.

## Checks and production

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## UI components

```sh
npx shadcn@latest add button
```

Components live in `src/components/ui`, shared utilities in `src/lib`, and theme tokens in `src/app/globals.css`. The `@/` alias resolves to `src/`.

See [AGENTS.md](AGENTS.md) for development conventions.

## Mock authentication

Auth is browser-local and explicitly demo-only. No Supabase configuration, database connection, or outgoing email is required.

- Demo email: `demo@bookmymovie.com`
- Demo password: `Demo123!`

The existing `AuthAdapter`, context, forms, and client route gate use `mock-auth-adapter.ts`. Signup logs in immediately; the session survives reloads and updates across tabs. Passwords are stored as salted Web Crypto PBKDF2 verifiers, never plaintext. This does not make browser-editable mock authentication secure. Use sample passwords only.

Profile changes persist in browser storage. The shared demo email and password are reserved. Forgot password only validates input and displays simulated feedback: no email is sent and no credentials are changed. A signed-in custom demo account can change its own demo password at `/reset-password`.

`AuthGate` redirects signed-out visitors to login and hides protected UI during initialization. It is a UI demonstration, not server authorization. Do not use mock user IDs to authorize sensitive operations. Booking reference profiles and all other feature mock data remain unchanged. Clearing this site's browser storage resets demo accounts.

## Feature mock data

**Edit database table mock records in `src/lib/mock-data.ts`.** It contains movies, theaters, screens, seats, showtimes, show-seat inventory, users, bookings, booking-seat assignments, and payments. Table feature mock files re-export the same records to preserve existing imports.

Seats and showtime inventory are generated from the screen/showtime configurations in that file. Preserve IDs referenced by other tables and keep booking-seat snapshots aligned with booking/payment totals.

Homepage screening configuration, artwork, benefits, upcoming-release previews, and promotional offers remain in their original feature mock files. The demo login seed stays in `src/features/auth/services/mock-auth-adapter.ts`. These are not part of the centralized table data.

Import individual collections from the existing feature paths or the complete fixture set from `@/lib/mock-data`. The supplied snake_case fields and short IDs are retained for fixture compatibility; these are not database seed records or UUIDs.

The fixtures contain 8 movies, 3 theaters, 6 screens, generated physical seats and showtime inventory, 10 showtimes, 5 reference users, 3 bookings, relational booking-seat assignments, and 3 mock payments. Reference users are separate from demo authentication accounts and have no passwords. No fixture data is written to a database or localStorage, and no other user's bookings are displayed by the authentication UI.

Booking assignments override generated seat occupancy. Booking `b3` includes a second standard seat (`sh5-s5-C6`) so its seat price snapshots match its supplied total of 420. Generated holds expire 15 minutes before their own showtime; pending booking holds use the booking expiry. Use `resolveShowSeatAvailability(show_seats, new Date())` from `@/features/showtimes/services/show-seat-availability` for current availability instead of reading raw fixture hold status. Passing an explicit date makes historical demos repeatable. The showtimes remain on November 7–8, 2026 as supplied; movie poster paths reference assets that have not been provided.

## Dynamic mock homepage

`src/features/home/services/home-content-service.ts` joins feature-owned fixtures into the homepage content model. `HomeExperience` shares city, Indian calendar date, search, and showtime selection across cards, results, theater counts, and the auditorium. The hero uses catalog records; benefits, upcoming releases, and active offers come from feature mock files.

Only future fixture showtimes are listed. Dates use Asia/Kolkata; expired schedules show empty states instead of fabricated availability. Seat prices and status come from showtime inventory, and rows come from physical screen seats. Hold expiry is rechecked every 30 seconds. Selecting another show resets selected seats. Preview actions never modify booking, payment, or inventory records. Missing posters use an accessible fallback.

## Expanded mock database

All table fixtures remain in `src/lib/mock-data.ts`. Movie and venue names are demo content;
show schedules and occupancy are fictional, not verified cinema listings. Auth is separate.

The fixed schedule spans **7–20 November 2026** in **Asia/Kolkata**. It contains 30 active
movies (plus inactive m9), 20 theaters in 8 cities, 45 screens, 2,516 showtimes, 2,826 physical
seats, 158,028 show-seat records, 5 reference users, 60 bookings, 177 booking-seat snapshots,
and 60 mock payments. Legacy IDs and the original booking references are retained.

Edit `MOCK_SCHEDULE_START`, `MOCK_SCHEDULE_DAYS`, movie/venue records and screen layouts
in the central file. The original sh1–sh10 records are preserved; generated shows skip any
conflicting interval. Four daily slots rotate suitable language catalogs with evening/weekend
price adjustments. Inventory uses a stable hash, including lightly occupied and sold-out shows.
Booking assignments override background occupancy; cancelled/expired bookings release seats.
Holds are fixed timestamps before their show, and the availability service releases them on expiry.
The schedule does not roll forward automatically; after its dates pass, future-only views empty.
Generic poster artwork is bundled for titles without an existing local poster.

Run `npm run validate:mock` to verify IDs, relationships, schedule overlaps, all city/date
combinations, inventory completeness, occupancy scenarios, booking/payment totals, expiry,
legacy references and deterministic regeneration. The default reference time is
`2026-11-06T09:30:00Z`; set `MOCK_VALIDATE_AT` to explicitly check a different evaluation time.
The fixture validator expects raw pending holds to be future at that evaluation time, while
runtime availability always resolves expired holds using the actual request/browser clock.

For the larger dataset, the home page omits seat inventory; movie and seat pages scope it to
the selected movie. Browser utilities do not import or regenerate the full mock database.

Booking discovery displays seven calendar days beginning with the earliest upcoming demo
show. The underlying 14-day fixtures remain available for integrity checks. Book Tickets
requires the existing mock login, and direct seat-selection URLs use the existing AuthGate.
This is demo UI access control only; it does not authorize any server-side database operation.

After a normal login, a dismissible seat-preferences modal lets the user save their five
seat priorities and usual ticket count. Booking-initiated login skips this prompt and returns
to the chosen booking destination. Preferences are validated, versioned and stored per Auth
user ID in localStorage (`bookmymovie:seat-preferences:<encoded-user-id>`). They remain in
that browser after logout and initialize the booking controls on the next visit. Restoring an
existing session does not reopen the modal. Closing the modal without saving preserves the
previous values; blocked storage is reported with retry feedback.

## Browser-only booking confirmation

`Confirm Booking` rechecks the authenticated mock user, showtime, seat inventory, and all
confirmed browser bookings before saving. `bookmymovie_bookings` is the only booking key;
seat availability is derived by overlaying its confirmations onto the read-only show inventory.
No separate availability key or payment record is written. Booking records include immutable
movie/venue/showtime details and seat-price snapshots, so success pages and My Bookings
remain readable after the fixed discovery dates pass. History is filtered by the existing Auth
user ID; all confirmations in this browser affect availability for their specific showtime.

Same-tab repeat clicks use an idempotency ID. When Web Locks are supported, read/check/write
is serialized across same-origin tabs; other tabs receive storage events. Browsers without
Web Locks fall back to a synchronous local read/check/write and cannot guarantee atomic
cross-tab writes. This is frontend-only demo state, not server authorization or a real reservation;
different browser profiles have independent data. Clearing storage removes confirmations.
Malformed booking data blocks confirmation instead of being silently overwritten. Storage
write failures leave the booking unconfirmed. No gateway or payment integration is involved.

Run `npm run validate:bookings` for behavioral checks covering confirmation, seat conflicts,
per-show availability, idempotent/competing requests, persistence and storage/session errors.
