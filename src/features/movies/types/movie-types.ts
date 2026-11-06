/** Movie fixture schema. Dates are ISO strings; IDs remain stable across demo features. */
export type Movie = {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  language: string;
  genre: string;
  duration_minutes: number;
  release_date: string;
  is_active: boolean;
  created_at: string;
};
