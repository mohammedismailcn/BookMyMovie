import type { ScreenLayout } from "@/features/screens/types/screen-layout";

type SeatPosition = { row_index: number; column_index: number };
const clamp = (value: number) => Math.max(0, Math.min(100, value));

/** Explainable geometry heuristics, not measured acoustics or noise levels. */
export function calculateSeatFeatures(screen: ScreenLayout, seat: SeatPosition) {
  const diagonal = Math.max(1, Math.hypot(screen.row_count - 1, screen.col_count - 1));
  const distance = (point: SeatPosition) => Math.hypot(point.row_index - seat.row_index, point.column_index - seat.column_index);
  const centerDistance = screen.screen_center_columns.length ? Math.min(...screen.screen_center_columns.map((column) => Math.abs(column - seat.column_index))) : Math.abs((screen.col_count - 1) / 2 - seat.column_index);
  const depth = Math.max(1, screen.row_count - 1);
  const idealDistance = Math.max(...[0, screen.row_count - 1].map((row) => Math.abs(row - screen.screen_row_index))) * 0.6;
  const view = clamp(100 - centerDistance / Math.max(1, (screen.col_count - 1) / 2) * 50 - Math.abs(Math.abs(seat.row_index - screen.screen_row_index) - idealDistance) / depth * 50);
  const speakerDistances = screen.speaker_positions.map(distance);
  const mean = speakerDistances.reduce((sum, value) => sum + value, 0) / Math.max(1, speakerDistances.length);
  const spread = Math.sqrt(speakerDistances.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, speakerDistances.length));
  const nearestSpeaker = speakerDistances.length ? Math.min(...speakerDistances) : undefined;
  const nearestExit = screen.exit_positions.length ? Math.min(...screen.exit_positions.map(distance)) : undefined;
  const sound = nearestSpeaker === undefined ? undefined : clamp(100 - spread / diagonal * 70 - Math.max(0, 1 - nearestSpeaker / 2) * 30);
  const quietSources = [nearestSpeaker, nearestExit].filter((value) => value !== undefined);
  const quiet = quietSources.length ? clamp(100 - quietSources.reduce((sum, value) => sum + Math.max(0, 1 - value / (diagonal * 0.4)) * 100, 0) / quietSources.length) : undefined;
  const exit = nearestExit === undefined ? undefined : clamp(100 - nearestExit / diagonal * 100);
  return { view, sound, quiet, exit };
}
