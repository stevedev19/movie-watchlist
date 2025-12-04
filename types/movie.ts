export type Movie = {
  id: string;
  title: string;
  year?: number;
  genre?: string;
  rating?: number;     // 1–5 (optional, for watched movies)
  notes?: string;      // short text note
  watched: boolean;
  createdAt: string;   // ISO date string
  watchedAt?: string;  // when marked as watched
};

