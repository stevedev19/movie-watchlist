import mongoose, { Schema, Model } from 'mongoose'
import { Movie as MovieType } from '@/types/movie'

export interface MovieDeletedDocument extends Omit<MovieType, 'id'>, mongoose.Document {
  userId: string
  deletedAt: string
  _id: mongoose.Types.ObjectId
}

const MovieDeletedSchema = new Schema<MovieDeletedDocument>(
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
    deletedAt: {
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
    collection: 'movies-deleted',
  }
)

const MovieDeleted: Model<MovieDeletedDocument> =
  mongoose.models.MovieDeleted || mongoose.model<MovieDeletedDocument>('MovieDeleted', MovieDeletedSchema, 'movies-deleted')

export default MovieDeleted

