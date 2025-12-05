import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequestCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequestCookie()

    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Authentication required', user: null },
        { status: 401 }
      );
    }

    // Return authenticated user data
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
