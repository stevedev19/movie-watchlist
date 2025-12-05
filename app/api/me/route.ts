import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequestCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Use the same authentication pattern as other routes (like /api/movies)
    const user = getUserFromRequestCookie() || { userId: 'guest', name: 'Guest' }

    // Return user data (guest if no auth cookie)
    return NextResponse.json({ 
      user: {
        id: user.userId,
        name: user.name,
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
