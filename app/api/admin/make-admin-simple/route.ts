import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/db'
import { User } from '@/models/User'

// POST /api/admin/make-admin-simple - Make a user an admin (no auth required for setup)
// This is a one-time setup route - you can remove it after assigning admin
export async function POST(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 503 }
      )
    }

    await connectToDB()

    const body = await request.json()
    const { username, secret } = body

    // Simple secret check (you can change this)
    if (secret !== 'make-admin-2024') {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 403 }
      )
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Find user by name
    const user = await User.findOne({ name: username })

    if (!user) {
      return NextResponse.json(
        { error: `User "${username}" not found` },
        { status: 404 }
      )
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { message: `User "${username}" is already an admin` },
        { status: 200 }
      )
    }

    // Update role to admin
    user.role = 'admin'
    await user.save()

    return NextResponse.json({
      message: `✅ Successfully assigned admin role to "${username}"`,
      user: {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error making user admin:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}


