import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequestCookie } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const user = getUserFromRequestCookie();

    // ✅ Not logged in → return 200 (frontend won’t crash)
    if (!user || !user.userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await connectToDB();
    const dbUser = await User.findById(user.userId).select("name role").lean();

    // ✅ If user not found → treat as logged out
    if (!dbUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        user: {
          id: user.userId,
          name: dbUser.name || "Unknown",
          role: (dbUser as { role?: 'admin' | 'user' }).role === 'admin' ? 'admin' : 'user',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/me:", error);
    // ✅ Never 401 here; return safe null
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

