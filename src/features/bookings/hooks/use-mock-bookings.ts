"use client";
import { useMockData } from "@/features/mock-data/components/mock-data-provider";
import type { MockBooking } from "@/features/bookings/types/booking-types";
const EMPTY: readonly MockBooking[] = [];
export function useMockBookings(): { bookings: readonly MockBooking[]; loading: boolean; error: string } {
  const { data, loading, error } = useMockData();
  return { bookings: data?.bookings ?? EMPTY, loading, error };
}
