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

    const existing = await User.findOne({ name });
    if (existing) {
      return NextResponse.json(
        { message: "This name is already taken." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // Check if this is the first user - make them admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const user = await User.create({
      name,
      password: hashed,
      role,
    });

    const token = signToken({ 
      userId: user._id.toString(), 
      name: user.name,
      role: user.role || 'user'
    });

    const res = NextResponse.json(
      {
        message: "Signup successful",
        user: { 
          id: user._id, 
          name: user.name,
          role: user.role || 'user'
        },
      },
      { status: 201 }
    );

    // Set httpOnly JWT cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
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

