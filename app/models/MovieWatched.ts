import mongoose, { Schema, Model } from 'mongoose'
import { Movie as MovieType } from '@/types/movie'

export interface MovieWatchedDocument extends Omit<MovieType, 'id'>, mongoose.Document {
  userId: string
  _id: mongoose.Types.ObjectId
}

const MovieWatchedSchema = new Schema<MovieWatchedDocument>(
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
      default: true,
    },
    createdAt: {
      type: String,
      required: true,
    },
    watchedAt: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'movies-watched',
  }
)

const MovieWatched: Model<MovieWatchedDocument> =
  mongoose.models.MovieWatched || mongoose.model<MovieWatchedDocument>('MovieWatched', MovieWatchedSchema, 'movies-watched')

export default MovieWatched

