import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "safetrack_session";

export function signSession(userId: string) {
  return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET) as { userId: string };
    return prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}

// Hackathon shortcut: if no session exists yet, fall back to the seeded
// demo user so the app is instantly usable without a login screen.
export async function getCurrentUserOrDemo() {
  const user = await getCurrentUser();
  if (user) return user;
  return prisma.user.findFirst({ where: { email: "david@safetrack.demo" } });
}
