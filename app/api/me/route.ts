import { NextResponse } from "next/server";
import { getUserFromRequestCookie } from "@/lib/auth";

export async function GET() {
  try {
    const user = getUserFromRequestCookie();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ 
      user: {
        id: user.userId,
        name: user.name,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

