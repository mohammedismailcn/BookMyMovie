import { readMockDatabase, mockDataSnapshot, subscribeMockData } from "@/features/mock-data/services/mock-data-store";
import type { MockBooking } from "@/features/bookings/types/booking-types";
export { parseMockBookings } from "@/features/bookings/services/booking-validation";
export { LEGACY_BOOKINGS_KEY as MOCK_BOOKINGS_KEY, MOCK_DATA_CHANGED as MOCK_BOOKINGS_CHANGED } from "@/features/mock-data/services/mock-data-store";

/** Compatibility facade: all live booking reads use the shared database. */
export function readMockBookings(): MockBooking[] { return readMockDatabase().bookings; }
export function bookingStorageSnapshot(): string { return mockDataSnapshot(); }
export function subscribeMockBookings(listener: () => void): () => void { return subscribeMockData(listener); }
