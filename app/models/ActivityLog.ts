import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId
  userName: string
  action: 'add' | 'update' | 'delete' | 'watch' | 'unwatch' | 'rate'
  movieId?: string
  movieTitle?: string
  details?: string
  timestamp: string
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['add', 'update', 'delete', 'watch', 'unwatch', 'rate'],
      required: true,
    },
    movieId: {
      type: String,
    },
    movieTitle: {
      type: String,
    },
    details: {
      type: String,
    },
    timestamp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

// Avoid OverwriteModelError in Next.js hot reload
export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)

