import { Db, ObjectId } from "mongodb";
import type { AccountStatus, UserRole } from "@x-chicken/shared";

export const COLLECTIONS = {
  USERS: "users",
  SESSIONS: "sessions",
  PASSWORD_RESETS: "password_resets",
  RATE_LIMITS: "rate_limits",
} as const;

export interface UserDocument {
  _id?: ObjectId;
  email: string;
  name: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  status: AccountStatus;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDocument {
  _id?: ObjectId;
  tokenHash: string;
  userId: ObjectId;
  role: UserRole;
  scope: "ADMIN" | "CUSTOMER" | "VENDOR";
  ip?: string;
  userAgent?: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
}

export interface PasswordResetDocument {
  _id?: ObjectId;
  tokenHash: string;
  userId: ObjectId;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

export interface RateLimitDocument {
  _id?: ObjectId;
  key: string;
  count: number;
  expiresAt: Date;
}

export async function ensureAuthIndexes(db: Db): Promise<void> {
  const users = db.collection<UserDocument>(COLLECTIONS.USERS);
  await users.createIndex({ email: 1 }, { unique: true, name: "uniq_user_email" });
  await users.createIndex({ role: 1, status: 1 }, { name: "idx_user_role_status" });

  const sessions = db.collection<SessionDocument>(COLLECTIONS.SESSIONS);
  await sessions.createIndex({ tokenHash: 1 }, { unique: true, name: "uniq_session_token_hash" });
  await sessions.createIndex({ userId: 1, scope: 1 }, { name: "idx_session_user_scope" });
  await sessions.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: "ttl_session_expiry" }
  );

  const resets = db.collection<PasswordResetDocument>(COLLECTIONS.PASSWORD_RESETS);
  await resets.createIndex({ tokenHash: 1 }, { unique: true, name: "uniq_reset_token_hash" });
  await resets.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: "ttl_reset_expiry" }
  );

  const limits = db.collection<RateLimitDocument>(COLLECTIONS.RATE_LIMITS);
  await limits.createIndex({ key: 1 }, { unique: true, name: "uniq_rate_limit_key" });
  await limits.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: "ttl_rate_limit_expiry" }
  );
}
