import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/db'
import { User } from '@/models/User'

export const dynamic = 'force-dynamic'

// GET /api/users - Get all registered users (for filtering)
export async function GET(_request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured. Please set MONGODB_URI in .env.local' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    
    await connectToDB()
    
    // Get all users
    const users = await User.find({}).select('_id name role').sort({ name: 1 })
    
    const usersList = users.map(user => ({
      id: user._id.toString(),
      name: user.name || 'Unknown',
      role: user.role === 'admin' ? 'admin' : 'user',
    }))
    
    return NextResponse.json(
      { users: usersList },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
