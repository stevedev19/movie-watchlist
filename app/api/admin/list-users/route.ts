import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/db'
import { User } from '@/models/User'

// GET /api/admin/list-users - List all users (for debugging)
export async function GET(_request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 503 }
      )
    }

    await connectToDB()

    const users = await User.find({}).select('name role _id').lean()

    return NextResponse.json({
      users: users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        role: (u as Record<string, unknown>).role || 'user',
      })),
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to list users' },
      { status: 500 }
    )
  }
}



