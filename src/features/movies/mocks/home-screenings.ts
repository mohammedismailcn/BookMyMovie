// Demo merchandising formats, not live theater/showtime availability.
export const SCREENING_FORMATS = ["All Formats", "Digital 2D", "IMAX with Laser", "Dolby Cinema", "4DX · RealD 3D"] as const;
export type ScreeningFormat = Exclude<(typeof SCREENING_FORMATS)[number], "All Formats">;
export const homeScreenings: readonly { movieId: string; format: ScreeningFormat; badge?: string }[] = [
  { movieId: "m8", format: "IMAX with Laser", badge: "Top pick" },
  { movieId: "m2", format: "Dolby Cinema" },
  { movieId: "m3", format: "4DX · RealD 3D" },
  { movieId: "m1", format: "Dolby Cinema" },
  { movieId: "m5", format: "IMAX with Laser", badge: "Fan favourite" },
];
