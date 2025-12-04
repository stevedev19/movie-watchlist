import mongoose, { Schema, Model } from 'mongoose'
import { Movie as MovieType } from '@/types/movie'

export interface MovieToWatchDocument extends Omit<MovieType, 'id'>, mongoose.Document {
  userId: string
  _id: mongoose.Types.ObjectId
}

const MovieToWatchSchema = new Schema<MovieToWatchDocument>(
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
    collection: 'movies-to-watch',
  }
)

const MovieToWatch: Model<MovieToWatchDocument> =
  mongoose.models.MovieToWatch || mongoose.model<MovieToWatchDocument>('MovieToWatch', MovieToWatchSchema, 'movies-to-watch')

export default MovieToWatch

