import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function getJWTSecret() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET missing in env. Please add JWT_SECRET to your .env.local file.");
  }
  return JWT_SECRET;
}

export function signToken(payload: { userId: string; name: string; role?: 'admin' | 'user' }) {
  return jwt.sign(payload, getJWTSecret(), { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

// Optional: get user from cookie on server
export function getUserFromRequestCookie() {
  if (!JWT_SECRET) {
    return null; // Return null if JWT_SECRET is not configured
  }

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; name: string; role?: 'admin' | 'user' };
    return decoded;
  } catch (err) {
    return null;
  }
}

// Check if user is admin
export function isAdmin(user: { userId: string; name: string; role?: 'admin' | 'user' } | null): boolean {
  return user?.role === 'admin';
}

