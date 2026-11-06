# BookMyMovie

A smart theater seat-booking demo built with Next.js and React. Discover movies, choose a theater and showtime, compare seats using personal preferences, and confirm a mock booking.

The project uses **Feature-Based Architecture** for code organization and a **rule-based weighted scoring algorithm** for seat recommendations.

> **Assignment scope:** Authentication, bookings, inventory, and persistence are browser-local demonstrations. No database connection, backend booking service, Supabase Auth, or payment gateway is required. Confirming a booking does not collect money or reserve a real cinema seat.

## Design references

| Reference | Link |
| --- | --- |
| UI design — Google Stitch | [BookMyMovie UI design](https://stitch.withgoogle.com/projects/17885167767798000086) |
| Database design — Eraser | [BookMyMovie database design](https://app.eraser.io/workspace/22LYg1CGNTgJa7ws8NJq?origin=share) |

These are the supplied project design references. Access depends on the sharing permissions of each service. The database diagram describes the intended relational design; the current application runs on static seeds and browser-local mock data.

## Quick start

**Prerequisites:** Node.js 22 LTS or newer, npm, and a modern browser with localStorage enabled.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables, API keys, database setup, or payment credentials are needed for the mock application. Use the same browser profile and origin throughout the review so saved accounts and bookings remain available.

For a production build:

```bash
npm run build
npm start
```

### Demo login

| Field | Value |
| --- | --- |
| Email | `demo@bookmymovie.com` |
| Password | `Demo123!` |

You can also create a mock account through `/signup`. Use a sample password, never a real one. Mock accounts and sessions are editable browser data and do not provide production security or server-side authorization.

## Suggested reviewer walkthrough

1. **Discover:** Open `/`, choose a city and date, and use **Find Shows** to open filtered results at `/movies`.
2. **Choose a show:** Open a movie to see its details, available theaters, screens, dates, prices, and showtimes.
3. **Sign in:** Booking actions require the existing mock login. Booking-initiated login returns to the selected destination.
4. **Choose seats:** Set the number of seats, adjust recommendation priorities, and compare the solid-green recommended group. Mobile preferences expand from a dropdown; the seat map supports swiping and arrow controls.
5. **Confirm:** Select available seats and use the fixed **Confirm Booking** bar. The total comes from the selected show's inventory prices.
6. **Verify persistence:** Review the confirmation page and `/my-bookings`, refresh, then reopen the same show. Confirmed seats remain unavailable.
7. **Evaluate data management:** Open `/dev/mock-data`, edit a movie, and verify the customer page reflects the change. Cancel a booking and verify its seats become available again; independent seeded occupancy remains intact.
8. **Review recovery:** Export JSON before experimenting with import or reset. Referenced records cannot be deleted until their dependents are removed.

**Schedule note:** Default showtimes use fixed dates, **7–20 November 2026**, in **Asia/Kolkata (IST)**. Discovery displays seven calendar days beginning with the earliest upcoming demo show. The schedule does not automatically roll forward. If reviewing later, create future showtimes in `/dev/mock-data`; past shows are intentionally unavailable.

## Implemented features

- Movie discovery, title/language/genre search, city/date filtering, and movie details.
- Theater and screen selection with showtime-specific prices and availability.
- Screen-driven seat layouts, seat types, exits, speaker positions, and legroom configuration.
- Adjacent-seat recommendations based on five adjustable preferences.
- Mock signup, login, logout, profile editing, persisted sessions, and client route guards.
- Per-user seat preferences, available after normal login or through **My Preferences** in the account menu.
- Browser-local booking confirmation, booking details, and user-specific booking history.
- Responsive mobile, tablet, and desktop layouts, including a fixed booking action bar.
- An evaluator dashboard for managing the shared mock dataset.

Forgot password provides simulated feedback only: it sends no email and changes no password. A custom signed-in mock account can change its demo password through `/reset-password`; the shared demo credentials are reserved.

## Technology stack

| Area | Implementation |
| --- | --- |
| Framework | Next.js 16, App Router |
| UI | React 19, TypeScript in strict mode |
| Styling | Tailwind CSS 4, project theme tokens, Poppins |
| Components | shadcn/ui button primitive built on Base UI; Base UI dialogs |
| Icons | Lucide React |
| State | React context, hooks, and `useSyncExternalStore` |
| Persistence | Versioned localStorage mock dataset |
| Checks | ESLint, TypeScript, production build, Node-based behavioral validators |
| Intended database architecture | PostgreSQL with Prisma — not installed or required by this demo |

Exact dependency ranges and available commands are defined in [package.json](package.json).

## Code organization: Feature-Based Architecture

The application is organized by business capability. Each feature owns its relevant components, types, services, validation, and mock adapters. App Router pages define routes and compose feature components; shared navigation and UI primitives remain outside individual features.

```text
src/
├── app/                         # App Router pages, layout, metadata, global styles
│   ├── (account)/               # Profile, history, booking confirmation, password pages
│   ├── dev/mock-data/           # Public demo/evaluator dashboard
│   ├── movies/                  # Listing and movie/theater selection routes
│   └── showtimes/               # Protected seat-selection route
├── components/
│   ├── layout/                  # Navbar and footer
│   └── ui/                      # Reusable UI primitives
├── features/
│   ├── auth/                    # Mock Auth adapter, context, forms, route gate
│   ├── bookings/                # Confirmation, validation, snapshots, history
│   ├── home/                    # Customer content composition and joins
│   ├── mock-data/               # Shared store, integrity checks, editor, provider
│   ├── movies/                  # Discovery, filters, cards, movie details
│   ├── recommendations/         # Feature scores, weighted ranking, preferences
│   ├── screens/                 # Screen layout types and seed re-exports
│   ├── seats/                   # Seat map and booking interaction
│   ├── showtimes/               # Discovery and availability calculations
│   ├── theaters/                # Venue presentation and seed re-exports
│   ├── payments/                # Static mock fixtures; no payment processing
│   └── users/                   # Static reference profiles
└── lib/
    ├── constants/routes.ts      # Shared route constants and dynamic path builders
    ├── mock-data.ts             # Original static table seeds
    └── utils.ts                 # Shared class-name utility

public/                          # Local logos, posters, and fallback artwork
scripts/                         # Behavioral and fixture validation scripts
```

**Data flow:** route → feature component → feature service/shared mock store → validated browser data. Recommendation calculations remain pure functions. Browser APIs stay in client-side boundaries; no server code treats the mock session as authorization.

Project conventions are maintained in the local `AGENTS.md` instructions.

### Main routes

| Route | Purpose | Mock login required? |
| --- | --- | --- |
| `/` | Home and discovery | No |
| `/movies` | Search/filter results | No |
| `/movies/[movieId]/theaters` | Movie details, theaters, dates, showtimes | No to browse; booking actions prompt login |
| `/showtimes/[showtimeId]/seats` | Seat selection and confirmation | Yes |
| `/bookings/[bookingId]/success` | Saved booking details/current status | Yes; filtered by user ID |
| `/my-bookings` | Current user's browser-local history | Yes |
| `/profile` | Mock account profile | Yes |
| `/login`, `/signup`, `/forgot-password` | Mock authentication pages | No |
| `/reset-password` | Change a custom account's demo password | Yes |
| `/dev/mock-data` | Evaluator data management | No |

The navigation also contains links for future areas such as offers and theater directories; those standalone pages are not implemented. Use the routes above for the assignment review.

## Recommendation: Rule-based weighted scoring algorithm

The engine ranks available groups of **1–6 adjacent seats** using the screen's own physical coordinates and configuration. It uses deterministic rules, not machine learning.

### Seat feature scores

Each available criterion produces a score from 0 to 100:

| Criterion | Rule used by the implementation |
| --- | --- |
| Center view | Penalizes horizontal distance from configured center columns and distance from an ideal viewing depth, approximately 60% of the screen's maximum row depth. |
| Extra legroom | Normalizes the seat's `legroom_cm` against the maximum legroom on that screen. |
| Balanced sound | Prefers more even distances to configured speakers and penalizes seats extremely close to a speaker. |
| Quick exit | Scores proximity to the nearest configured exit, normalized by the auditorium diagonal. |
| Quiet zone | Favors distance from nearby speakers and exits, used as heuristic noise/traffic sources. |

Sound and quiet scores are geometry-based estimates, not measured acoustics or noise levels. Criteria that cannot be calculated from the screen configuration are omitted from the weighted calculation.

### Weights and ranking

**Low**, **Med**, and **High** map to weights **1**, **2**, and **3**. The defaults are view 3, legroom 2, sound 3, exit 1, and quiet 2.

```text
seat score = Σ(feature score × preference weight) / Σ(available preference weights)
group score = round(average seat score across the requested adjacent seats)
```

For example, feature scores of 90, 80, 70, 60, and 80 with the default weights produce a seat score of `860 / 11 ≈ 78.18`.

The algorithm:

1. Excludes booked seats and unexpired holds for the selected showtime.
2. Builds groups in the same row with consecutive physical column positions.
3. Rejects incomplete groups, so recommendations do not cross missing-seat gaps or row boundaries.
4. Computes the group's average weighted score.
5. Sorts by score, breaking ties by the first seat label, and returns the best group.

If no group fits, the UI suggests reducing the quantity or choosing seats manually. Recommendations never reserve seats or create bookings; the score is guidance, not a guarantee of an objectively perfect seat.

Implementation: [feature scores](src/features/recommendations/services/seat-feature-scores.ts), [group ranking](src/features/recommendations/services/recommend-seats.ts), and [preference storage](src/features/recommendations/services/seat-preference-storage.ts).

## Mock data and persistence

### One shared editable dataset

[src/lib/mock-data.ts](src/lib/mock-data.ts) remains the original default seed source. Feature mock files re-export those records. The editable browser dataset is initialized from these seeds and managed by [src/features/mock-data](src/features/mock-data).

| Storage key | Purpose |
| --- | --- |
| `bookmymovie_mock_data` | Shared versioned movies, theaters, screens, showtimes, seats, bookings, and reference users |
| `bookmymovie_bookings` | Legacy booking archive; imported only when the shared dataset is missing |
| `bookmymovie.demo-auth.v1` | Mock login accounts with salted password verifiers |
| `bookmymovie.demo-session.v1` | Current mock login identity |
| `bookmymovie:seat-preferences:<encoded-user-id>` | Validated seat priorities and usual quantity for that user |

Customer discovery, seat selection, confirmation, and booking history use the same shared store as the dashboard. Components subscribe through the provider/hook rather than accessing localStorage individually. The initial server render uses a loading state until browser data is available, avoiding mismatches between static defaults and saved evaluator changes.

The large show-seat table is derived rather than persisted as a second mutable copy. Availability combines:

- Physical seats belonging to the selected screen.
- Independent seeded booked/held statuses, with expired holds released.
- Current `CONFIRMED` bookings for that specific showtime.

Only confirmed bookings reserve seats in the editable dataset. Cancelling or deleting a booking releases its assignments. `PENDING_PAYMENT`, `CANCELLED`, and `EXPIRED` bookings do not reserve seats. Inventory for newly created shows/seats derives from the show base price, with supplements of ₹50 for premium seats and ₹120 for recliners.

### Booking integrity within this browser

Confirmation re-reads the current store, checks the mock user and showtime, validates the selected seats, derives prices from inventory, and saves a `CONFIRMED` booking. Display details and seat prices are stored as snapshots so history remains readable after catalog changes or the discovery window expires.

Request IDs prevent duplicate confirmations. Where available, Web Locks serialize same-origin tab updates; storage events refresh other tabs. Without Web Locks, cross-tab atomicity is not guaranteed. Different browsers/profiles have independent data: this is not database-backed concurrency control.

Malformed data blocks writes instead of being silently discarded. Failed storage/quota writes leave the previous dataset intact. There is no separate mutable seat-availability store and no payment record is created by confirmation.

## Evaluator dashboard

Open **[/dev/mock-data](http://localhost:3000/dev/mock-data)** without signing in.

The dashboard provides seven tables: **Movies, Theaters, Screens, Showtimes, Seats, Bookings, and Mock Users**.

- Search across fields, use entity filters where available, and page through large collections.
- Create/edit records through dialogs. Stable IDs are read-only when editing.
- Edit nested screen layout arrays through validated JSON fields; coordinates are zero-based.
- Validate required fields, dates/timezones, numeric values, foreign references, seat ownership, capacity, overlapping active showtimes, and duplicate confirmed seat assignments.
- Require confirmation for deletion, import replacement, and reset. Referenced records are blocked; remove their dependents explicitly. There is no automatic cascade.
- Export a versioned JSON backup, or import a compatible export after complete validation.
- Recover malformed/outdated storage through recovery export followed by an explicit import or reset.

**Creating a screen:** New screens begin with zero physical seats. Add seat records in the Seats table; capacity follows the actual count. Layout changes do not automatically regenerate physical seats. Then create a non-overlapping showtime for the desired movie and screen.

**Editing bookings:** Select an existing user and showtime, supply 1–6 distinct seat IDs from that screen, and choose a status. The editor derives movie/theater/screen references and price snapshots. Customer My Bookings reflects the current status for its existing Auth user ID.

**Mock Users:** These are booking reference profiles, not login accounts. The demo Auth ID is included; custom Auth IDs are registered when those users confirm bookings. Editing a reference profile does not change credentials or sessions.

**Reset:** Restores the default catalog and seed bookings, replacing evaluator changes and browser-created bookings. Login accounts and saved preferences remain. Export a backup first. Once the shared store exists, the legacy booking archive is not re-imported.

## Validation

```bash
npm run lint
npm run typecheck
npm run validate:bookings
npm run validate:mock-dashboard
npm run build
```

| Command | Coverage |
| --- | --- |
| `lint` | ESLint checks |
| `typecheck` | Strict TypeScript checks without emitting files |
| `validate:bookings` | Confirmation, totals, invalid/unavailable seats, per-show isolation, idempotency, competing requests, persistence, and storage/session failures |
| `validate:mock-dashboard` | CRUD and full screen/seat/show lifecycle, references, overlap/date/number validation, cancellation/deletion release, migration, import/export/reset, corrupt/versioned storage, quota failures, and serialized writes |
| `build` | Production compilation and route generation |

These commands passed during implementation. Desktop and mobile browser checks also covered dashboard edits appearing on customer routes, newly created movie routes, deletion protection, booking cancellation/reconfirmation, and availability after refresh. Behavioral validators use Node assertions and the existing TypeScript dependency; no additional test framework is required.

An additional static-seed check is available:

```bash
npm run validate:mock
```

**Known failing check:** The unchanged seed dataset currently triggers `Movie without repeat daily theater showtimes: m2`. This is a pre-existing fixture scheduling assertion. It is not suppressed or reported as passing; the shared-store/booking validators above pass independently. The fixture validator defaults to `2026-11-06T09:30:00Z`; `MOCK_VALIDATE_AT` can select a different evaluation time.

## Scope and limitations

- Everything persists in this browser profile and origin only. Clearing site storage removes saved changes, mock accounts, preferences, and customer bookings.
- Mock authentication and route guards demonstrate UX, not secure authorization. Use sample credentials only.
- No real payment, email delivery, seat hold transaction, refund, or ticket issuance occurs.
- The PostgreSQL/Prisma design is a future implementation target. This repository does not currently implement database transactions, database locks, payment webhooks, a production admin system, or a complete admin/analytics feature.
- Independent seeded occupancy remains fixture-driven. The dashboard manages booking assignments, not a separate show-seat status editor.
- Existing ticket snapshots are preserved; editing catalog/showtime metadata is not a full rescheduling workflow.
- Server metadata uses default fixtures because it cannot read browser localStorage. Customer page content uses the persisted dataset after initialization.
- Poster coverage varies. Missing images use the movie-card fallback; supported editor URLs are local asset paths or the configured Pollinations prompt URLs.

## Useful entry points

- [Application routes](src/lib/constants/routes.ts)
- [Default seed records](src/lib/mock-data.ts)
- [Shared mock store](src/features/mock-data/services/mock-data-store.ts)
- [Dataset validation](src/features/mock-data/services/mock-data-validation.ts)
- [Derived inventory](src/features/mock-data/services/mock-inventory.ts)
- [Booking confirmation service](src/features/bookings/services/mock-booking-service.ts)
- [Recommendation engine](src/features/recommendations/services/recommend-seats.ts)
- [Mock authentication adapter](src/features/auth/services/mock-auth-adapter.ts)
