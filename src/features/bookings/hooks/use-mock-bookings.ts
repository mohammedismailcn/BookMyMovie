"use client";
import { useMemo, useSyncExternalStore } from "react";
import { BOOKING_STORAGE_UNAVAILABLE, bookingStorageSnapshot, parseMockBookings, subscribeMockBookings } from "@/features/bookings/services/mock-booking-store";
import type { MockBooking } from "@/features/bookings/types/booking-types";

const serverSnapshot = () => undefined;
export function useMockBookings(): { bookings: readonly MockBooking[]; loading: boolean; error: string } {
  const raw = useSyncExternalStore<string | null | undefined>(subscribeMockBookings, bookingStorageSnapshot, serverSnapshot);
  return useMemo(() => {
    if (raw === undefined) return { bookings: [], loading: true, error: "" };
    if (raw === BOOKING_STORAGE_UNAVAILABLE) return { bookings: [], loading: false, error: "Browser storage is unavailable. Enable local storage to view or confirm bookings." };
    try { return { bookings: parseMockBookings(raw), loading: false, error: "" }; }
    catch (cause) { return { bookings: [], loading: false, error: cause instanceof Error ? cause.message : "Unable to load bookings." }; }
  }, [raw]);
}
