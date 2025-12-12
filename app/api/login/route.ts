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

    await connectToDB();

    const user = await User.findOne({ name });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid name or password." },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { message: "Invalid name or password." },
        { status: 401 }
      );
    }

    const role: 'admin' | 'user' = user.role === 'admin' ? 'admin' : 'user';

    const token = signToken({ 
      userId: user._id.toString(), 
      name: user.name,
      role
    });

    const res = NextResponse.json(
      {
        message: "Login successful",
        user: { 
          id: user._id, 
          name: user.name,
          role
        },
      },
      { status: 200 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

