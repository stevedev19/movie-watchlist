export type Movie = {
  id: string;
  title: string;
  year?: number;
  genre?: string;
  image?: string;      // Movie poster/image URL (deprecated, use imageUrl)
  imageUrl?: string | null;   // Base64 data URL or file URL for movie poster
  hasImage?: boolean;  // Whether the movie has an uploaded image
  imageType?: 'uploaded' | 'other' | string;  // Type of image
  rating?: number;     // 1–5 (optional, for watched movies)
  notes?: string;      // short text note
  watched: boolean;
  createdAt: string;   // ISO date string
  watchedAt?: string;  // when marked as watched
  userId?: string;     // ID of the user who registered the movie
  userName?: string;   // Name of the user who registered the movie
};

