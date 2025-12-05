// Script to make a user an admin
// Usage: node scripts/make-admin.js <username>

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: String, required: true },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function makeAdmin() {
  try {
    const username = process.argv[2] || 'steve'
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env.local')
      process.exit(1)
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const user = await User.findOne({ name: username })
    
    if (!user) {
      console.error(`❌ User "${username}" not found`)
      process.exit(1)
    }

    if (user.role === 'admin') {
      console.log(`ℹ️  User "${username}" is already an admin`)
      process.exit(0)
    }

    user.role = 'admin'
    await user.save()

    console.log(`✅ Successfully assigned admin role to "${username}"`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

makeAdmin()

