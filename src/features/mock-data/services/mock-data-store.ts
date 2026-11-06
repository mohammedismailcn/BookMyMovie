import { DEFAULT_MOCK_DATABASE, type MockDatabase } from "@/features/mock-data/types/mock-database";
import { validateMockDatabase, object } from "@/features/mock-data/services/mock-data-validation";
import { parseMockBookings } from "@/features/bookings/services/booking-validation";

export const MOCK_DATA_KEY = "bookmymovie_mock_data";
export const MOCK_DATA_CHANGED = "bookmymovie:mock-data-changed";
export const LEGACY_BOOKINGS_KEY = "bookmymovie_bookings";
const VERSION = 1;
const SEED_VERSION = "2026-11-catalog-1";
const BLOCKED = "__mock_data_storage_unavailable__";
let cachedRaw: string | undefined;
let cachedData: MockDatabase | undefined;
export function mockDataSnapshot(): string {
  try { return window.localStorage.getItem(MOCK_DATA_KEY) ?? `legacy:${window.localStorage.getItem(LEGACY_BOOKINGS_KEY) ?? ""}`; }
  catch { return BLOCKED; }
}
export function parseMockDataFile(raw: string): MockDatabase {
  let envelope: unknown;
  try { envelope = JSON.parse(raw); } catch { throw new Error("Invalid JSON. No browser data was changed."); }
  if (!object(envelope) || envelope.version !== VERSION || envelope.seedVersion !== SEED_VERSION) throw new Error("Unsupported mock data version. Export this data for recovery, then reset or import a compatible export.");
  return validateMockDatabase(envelope.data);
}
export function serializeMockData(data: MockDatabase): string { return JSON.stringify({ version: VERSION, seedVersion: SEED_VERSION, data }); }
export function readMockDatabase(): MockDatabase {
  const raw = mockDataSnapshot();
  if (raw === BLOCKED) throw new Error("Browser storage is unavailable. Enable local storage to edit data or book seats.");
  if (raw === cachedRaw && cachedData) return cachedData;
  let database: MockDatabase;
  if (raw.startsWith("legacy:")) {
    const legacy = parseMockBookings(raw.slice(7) || null);
    const users = [...DEFAULT_MOCK_DATABASE.users];
    for (const booking of legacy) if (!users.some(user => user.id === booking.user_id)) users.push({ id: booking.user_id, name: "Imported booking user", email: `${booking.user_id}@imported.demo.invalid`, created_at: booking.created_at });
    database = validateMockDatabase({ ...DEFAULT_MOCK_DATABASE, users, bookings: [...DEFAULT_MOCK_DATABASE.bookings, ...legacy] });
  } else database = parseMockDataFile(raw);
  cachedRaw = raw; cachedData = database;
  return database;
}
export function subscribeMockData(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => { if (event.key === MOCK_DATA_KEY || event.key === LEGACY_BOOKINGS_KEY || event.key === null) listener(); };
  window.addEventListener("storage", onStorage); window.addEventListener(MOCK_DATA_CHANGED, listener); window.addEventListener("focus", listener);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(MOCK_DATA_CHANGED, listener); window.removeEventListener("focus", listener); };
}
export function withMockDataLock<T>(operation: () => T | Promise<T>): Promise<T> {
  return typeof navigator !== "undefined" && navigator.locks ? navigator.locks.request(MOCK_DATA_KEY, operation) : Promise.resolve().then(operation);
}
function write(data: MockDatabase): void {
  validateMockDatabase(data);
  try { window.localStorage.setItem(MOCK_DATA_KEY, serializeMockData(data)); }
  catch { throw new Error("Could not save mock data. Check browser storage or quota. Your previous data was not changed."); }
  window.dispatchEvent(new Event(MOCK_DATA_CHANGED));
}
export function updateMockDatabase(change: (current: MockDatabase) => MockDatabase): Promise<void> {
  return withMockDataLock(() => write(change(readMockDatabase())));
}
/** Explicit replacement also recovers corrupt/outdated storage; callers must confirm it. */
export function replaceMockDatabase(data: MockDatabase): Promise<void> { return withMockDataLock(() => write(data)); }
export function resetMockDatabase(): Promise<void> { return replaceMockDatabase(DEFAULT_MOCK_DATABASE); }
export function downloadMockData(raw = false): void {
  const text = raw ? mockDataSnapshot().replace(/^legacy:/, "") : serializeMockData(readMockDatabase());
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = raw ? "bookmymovie-recovery.json" : "bookmymovie-mock-data.json"; link.click(); URL.revokeObjectURL(url);
}
