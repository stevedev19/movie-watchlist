import mongoose, { Schema, Model } from 'mongoose'
import { Movie as MovieType } from '@/types/movie'

export interface MovieDocument extends Omit<MovieType, 'id'>, mongoose.Document {
  userId: string
  _id: mongoose.Types.ObjectId
}

const MovieSchema = new Schema<MovieDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
    },
    genre: {
      type: String,
    },
    notes: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    watched: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: String,
      required: true,
    },
    watchedAt: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model overwrite during hot reloads
const Movie: Model<MovieDocument> =
  mongoose.models.Movie || mongoose.model<MovieDocument>('Movie', MovieSchema)

export default Movie


