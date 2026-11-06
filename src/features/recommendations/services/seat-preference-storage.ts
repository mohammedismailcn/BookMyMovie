import { DEFAULT_SEAT_PREFERENCES, type SeatPreferences } from "@/features/recommendations/services/recommend-seats";

export type SavedSeatPreferences = { version: 1; preferences: SeatPreferences; quantity: number };
export const DEFAULT_SAVED_SEAT_PREFERENCES: SavedSeatPreferences = { version: 1, preferences: DEFAULT_SEAT_PREFERENCES, quantity: 2 };
export function seatPreferenceStorageKey(userId: string): string {
  return `bookmymovie:seat-preferences:${encodeURIComponent(userId)}`;
}
function isWeight(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= 1 && value <= 3;
}
export function parseSeatPreferences(raw: string | null): SavedSeatPreferences | null {
  if (!raw) return null;
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1 || !("quantity" in value) || typeof value.quantity !== "number" || !Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > 6 || !("preferences" in value)) return null;
  const preferences = value.preferences;
  if (!preferences || typeof preferences !== "object" || !("view" in preferences) || !isWeight(preferences.view) || !("legroom" in preferences) || !isWeight(preferences.legroom) || !("sound" in preferences) || !isWeight(preferences.sound) || !("exit" in preferences) || !isWeight(preferences.exit) || !("quiet" in preferences) || !isWeight(preferences.quiet)) return null;
  return { version: 1, quantity: value.quantity, preferences: { view: preferences.view, legroom: preferences.legroom, sound: preferences.sound, exit: preferences.exit, quiet: preferences.quiet } };
}
export function loadSeatPreferences(userId: string): SavedSeatPreferences {
  return parseSeatPreferences(window.localStorage.getItem(seatPreferenceStorageKey(userId))) ?? DEFAULT_SAVED_SEAT_PREFERENCES;
}
export function saveSeatPreferences(userId: string, value: SavedSeatPreferences): void {
  const validated = parseSeatPreferences(JSON.stringify(value));
  if (!validated) throw new Error("Please choose valid seat preferences.");
  window.localStorage.setItem(seatPreferenceStorageKey(userId), JSON.stringify(validated));
}
