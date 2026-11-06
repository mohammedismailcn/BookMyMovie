import type { ShowSeat, ShowSeatStatus } from "@/features/showtimes/types/show-seat-types";

/** Evaluate availability at an explicit time so expired mock holds never block seats. */
export function getShowSeatStatus(seat: ShowSeat, at: Date): ShowSeatStatus {
  if (!Number.isFinite(at.getTime())) throw new Error("Availability requires a valid date.");
  if (seat.status !== "HELD") return seat.status;
  const expiresAt = seat.held_until === null ? NaN : Date.parse(seat.held_until);
  return Number.isFinite(expiresAt) && expiresAt > at.getTime() ? "HELD" : "AVAILABLE";
}

export function resolveShowSeatAvailability(seats: readonly ShowSeat[], at: Date): ShowSeat[] {
  return seats.map((seat) => {
    const status = getShowSeatStatus(seat, at);
    return { ...seat, status, held_until: status === "HELD" ? seat.held_until : null };
  });
}
