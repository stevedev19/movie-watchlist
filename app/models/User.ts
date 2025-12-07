import mongoose, { Schema, Model } from 'mongoose'
import { User as UserType } from '../types/auth'

export interface UserDocument extends Omit<UserType, 'id'>, mongoose.Document {
  email: string
  name?: string
  passwordHash: string
  createdAt: string
  _id: mongoose.Types.ObjectId
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    createdAt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model overwrite during hot reloads
const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)

export default User

