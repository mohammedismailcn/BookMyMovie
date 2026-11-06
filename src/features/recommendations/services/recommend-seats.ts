import { calculateSeatFeatures } from "@/features/recommendations/services/seat-feature-scores";
import { getPreviewSeats, type HomeContent, type HomeShow } from "@/features/home/services/home-content-utils";

export type SeatPreferences = { view: number; legroom: number; sound: number; exit: number; quiet: number };
export const DEFAULT_SEAT_PREFERENCES: SeatPreferences = { view: 3, legroom: 2, sound: 3, exit: 1, quiet: 2 };

/** Rank contiguous groups within a row without reserving seats. */
export function recommendSeats(content: HomeContent, show: HomeShow, quantity: number, preferences: SeatPreferences, at: Date) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 6) return undefined;
  const available = getPreviewSeats(content, show, at).filter((seat) => !seat.reserved);
  const physical = content.seats.filter((seat) => seat.screen_id === show.screen_id);
  const candidates = available.flatMap((first) => {
    const group = Array.from({ length: quantity }, (_, index) => available.find((seat) => seat.row === first.row && physical.find((item) => item.id === seat.id)?.column_index === (physical.find((item) => item.id === first.id)?.column_index ?? -1) + index));
    if (group.some((seat) => !seat)) return [];
    const seats = group.flatMap((seat) => seat ? [seat] : []);
    const score = seats.reduce((sum, seat) => {
      const position = physical.find((item) => item.id === seat.id);
      if (!position) return sum;
      const features = calculateSeatFeatures(show.screen, position);
      const values = [
        { score: features.view, weight: preferences.view },
        { score: Math.min(100, position.legroom_cm / Math.max(1, ...physical.map((seat) => seat.legroom_cm)) * 100), weight: preferences.legroom },
        { score: features.sound, weight: preferences.sound },
        { score: features.exit, weight: preferences.exit },
        { score: features.quiet, weight: preferences.quiet },
      ].filter((item) => item.score !== undefined);
      const weight = values.reduce((total, item) => total + item.weight, 0);
      return sum + values.reduce((total, item) => total + (item.score ?? 0) * item.weight, 0) / Math.max(1, weight);
    }, 0) / quantity;
    return [{ seats, score: Math.round(score) }];
  });
  return candidates.sort((a, b) => b.score - a.score || a.seats[0].label.localeCompare(b.seats[0].label))[0];
}
