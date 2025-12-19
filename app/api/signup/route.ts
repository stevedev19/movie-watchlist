import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json(
        { message: "Name and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectToDB();

    // ✅ Case-insensitive duplicate check
    const existing = await User.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existing) {
      return NextResponse.json(
        { message: "This name is already taken." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // First user becomes admin
    const userCount = await User.countDocuments();
    const role: "admin" | "user" = userCount === 0 ? "admin" : "user";

    const user = await User.create({
      name,
      password: hashed,
      role,
    });

    const token = signToken({
      userId: user._id.toString(),
      name: user.name,
      role,
    });

    const res = NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: user._id,
          name: user.name,
          role,
        },
      },
      { status: 201 }
    );

    // ✅ HTTP VPS cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: false, // 🔥 REQUIRED for http:// VPS
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
