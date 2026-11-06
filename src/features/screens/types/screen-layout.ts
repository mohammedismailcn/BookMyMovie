export type ScreenPoint = { name: string; row_index: number; column_index: number };

export type ScreenLayout = {
  row_count: number;
  col_count: number;
  screen_row_index: number;
  screen_center_columns: readonly number[];
  extra_legroom_after_rows: readonly number[];
  exit_positions: readonly ScreenPoint[];
  speaker_positions: readonly ScreenPoint[];
};
