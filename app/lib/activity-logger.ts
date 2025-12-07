import connectDB from './mongodb'
import { ActivityLog } from '../models/ActivityLog'
import mongoose from 'mongoose'

export interface LogActivityParams {
  userId: string
  userName: string
  action: 'add' | 'update' | 'delete' | 'watch' | 'unwatch' | 'rate'
  movieId?: string
  movieTitle?: string
  details?: string
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    if (!process.env.MONGODB_URI) {
      return // Skip logging if MongoDB is not configured
    }

    await connectDB()

    const activityLog = new ActivityLog({
      userId: new mongoose.Types.ObjectId(params.userId),
      userName: params.userName,
      action: params.action,
      movieId: params.movieId,
      movieTitle: params.movieTitle,
      details: params.details,
      timestamp: new Date().toISOString(),
    })

    await activityLog.save()
  } catch (error) {
    // Don't throw error - logging should not break the main functionality
    console.error('Error logging activity:', error)
  }
}


