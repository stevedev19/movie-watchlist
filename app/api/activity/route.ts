import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import { ActivityLog } from '@/app/models/ActivityLog'
import { getUserFromRequestCookie, isAdmin } from '@/lib/auth'

// GET /api/activity - Get all activity logs (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured. Please set MONGODB_URI in .env.local' },
        { status: 503 }
      )
    }

    await connectDB()

    // Check if user is admin
    const user = getUserFromRequestCookie()
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const userId = searchParams.get('userId')

    // Build query
    const query: any = {}
    if (userId) {
      query.userId = userId
    }

    // Fetch activity logs
    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    const total = await ActivityLog.countDocuments(query)

    return NextResponse.json({
      logs,
      total,
      limit,
      skip,
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}


