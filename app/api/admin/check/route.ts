import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequestCookie, isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequestCookie();

    if (!user || !user.userId) {
      return NextResponse.json(
        { isAdmin: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const admin = isAdmin(user);

    return NextResponse.json({ 
      isAdmin: admin,
      role: user.role || 'user'
    }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/admin/check:", error);
    return NextResponse.json(
      { isAdmin: false, error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}

