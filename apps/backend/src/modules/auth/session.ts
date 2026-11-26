import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import type { UserRole } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import { COLLECTIONS, SessionDocument, UserDocument } from "@/database/collections";
import { generateOpaqueToken, hashToken } from "@/modules/auth/password";

export const COOKIE_NAMES = {
  CUSTOMER: "xc_customer_session",
  ADMIN: "xc_admin_session",
  VENDOR: "xc_vendor_session",
} as const;

const SESSION_TTL_MS = {
  CUSTOMER: 7 * 24 * 60 * 60 * 1000, // 7 days
  ADMIN: 12 * 60 * 60 * 1000, // 12 hours
  VENDOR: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export type SessionScope = "ADMIN" | "CUSTOMER" | "VENDOR";

export function parseCookieHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

export function setSessionCookie(
  response: NextResponse,
  scope: SessionScope,
  rawToken: string
): void {
  const isProd = process.env.NODE_ENV === "production";
  const cookieName = COOKIE_NAMES[scope];
  const maxAgeSeconds = Math.floor(SESSION_TTL_MS[scope] / 1000);

  response.cookies.set(cookieName, rawToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie(response: NextResponse, scope: SessionScope): void {
  const isProd = process.env.NODE_ENV === "production";
  const cookieName = COOKIE_NAMES[scope];

  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function createSession(params: {
  userId: ObjectId;
  role: UserRole;
  scope: SessionScope;
  ip?: string;
  userAgent?: string;
}): Promise<string> {
  const rawToken = generateOpaqueToken(32);
  const tokenHash = hashToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS[params.scope]);

  const sessions = await getCollection<SessionDocument>(COLLECTIONS.SESSIONS);
  await sessions.insertOne({
    tokenHash,
    userId: params.userId,
    role: params.role,
    scope: params.scope,
    ip: params.ip,
    userAgent: params.userAgent,
    expiresAt,
    revokedAt: null,
    createdAt: now,
  });

  return rawToken;
}

export async function validateSession(
  rawToken: string | null,
  expectedScope: SessionScope
): Promise<{ user: UserDocument; session: SessionDocument } | null> {
  if (!rawToken || rawToken.length < 32) return null;

  const tokenHash = hashToken(rawToken);
  const sessions = await getCollection<SessionDocument>(COLLECTIONS.SESSIONS);
  const session = await sessions.findOne({
    tokenHash,
    scope: expectedScope,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;

  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const user = await users.findOne({ _id: session.userId });
  if (!user || user.status !== "ACTIVE") return null;

  return { user, session };
}

export async function revokeSessionByToken(
  rawToken: string | null,
  scope: SessionScope
): Promise<void> {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  const sessions = await getCollection<SessionDocument>(COLLECTIONS.SESSIONS);
  await sessions.updateOne(
    { tokenHash, scope, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

export async function revokeAllUserSessions(userId: ObjectId): Promise<void> {
  const sessions = await getCollection<SessionDocument>(COLLECTIONS.SESSIONS);
  await sessions.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}
