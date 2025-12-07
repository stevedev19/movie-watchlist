import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequestCookie } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequestCookie()

    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Authentication required', user: null },
        { status: 401 }
      );
    }

    // Fetch user from database to get latest role
    await connectToDB();
    const dbUser = await User.findById(user.userId).select('name role');
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found', user: null },
        { status: 404 }
      );
    }

    // Return authenticated user data with role
    return NextResponse.json({ 
      user: {
        id: user.userId,
        name: dbUser.name,
        role: dbUser.role || 'user',
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json(
      { error: 'Authentication failed', user: null },
      { status: 401 }
    );
  }
}
