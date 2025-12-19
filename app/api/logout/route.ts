import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json(
    { message: "Logged out" },
    { status: 200 }
  );

  res.cookies.set("token", "", {
    httpOnly: true,
    secure: false,     // 🔥 MUST be false on HTTP VPS
    sameSite: "lax",
    path: "/",         // MUST match login cookie
    maxAge: 0,         // expire immediately
  });

  return res;
}
