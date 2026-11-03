import 'server-only'
import mongoose from 'mongoose'

const HOUR_MS = 60 * 60 * 1000
const QUESTIONS_PER_HOUR = 10

type AskQuota = { _id: string; window: number; count: number }

// One small document per user. MongoDB's atomic update shares the quota across instances.
// Call after connectDB; valid attempts count even when the provider fails.
export async function consumeAskQuota(userId: string) {
  const now = Date.now()
  const window = Math.floor(now / HOUR_MS)
  const collection = mongoose.connection.collection<AskQuota>('ask-rate-limits')
  const update = [{ $set: {
    window,
    count: { $cond: [
      { $eq: ['$window', window] },
      { $min: [{ $add: ['$count', 1] }, QUESTIONS_PER_HOUR + 1] },
      1,
    ] },
  } }]
  let quota
  try {
    quota = await collection.findOneAndUpdate({ _id: userId }, update, { upsert: true, returnDocument: 'after' })
  } catch (error) {
    // Concurrent first requests can race on the unique _id during upsert.
    if ((error as { code?: number }).code !== 11000) throw error
    quota = await collection.findOneAndUpdate({ _id: userId }, update, { returnDocument: 'after' })
  }
  if (!quota) throw new Error('Could not check question quota')
  return {
    remaining: Math.max(0, QUESTIONS_PER_HOUR - quota.count),
    resetsAt: (window + 1) * HOUR_MS,
    allowed: quota.count <= QUESTIONS_PER_HOUR,
    retryAfter: Math.ceil(((window + 1) * HOUR_MS - now) / 1000),
  }
}

// Read quota without spending a question when the section first opens.
export async function getAskQuota(userId: string) {
  const now = Date.now()
  const window = Math.floor(now / HOUR_MS)
  const quota = await mongoose.connection.collection<AskQuota>('ask-rate-limits').findOne({ _id: userId })
  return {
    remaining: Math.max(0, QUESTIONS_PER_HOUR - (quota?.window === window ? quota.count : 0)),
    resetsAt: (window + 1) * HOUR_MS,
  }
}
