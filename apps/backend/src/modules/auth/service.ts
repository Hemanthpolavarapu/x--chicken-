import { ObjectId } from "mongodb";
import {
  USER_ROLES,
  type AuthUser,
  type LoginInput,
  type RegisterCustomerInput,
  type UpdateCustomerProfileInput,
} from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import {
  COLLECTIONS,
  PasswordResetDocument,
  UserDocument,
} from "@/database/collections";
import { ApiError } from "@/lib/apiResponse";
import {
  generateOpaqueToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "@/modules/auth/password";
import {
  createSession,
  revokeAllUserSessions,
  SessionScope,
} from "@/modules/auth/session";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

export function toPublicUser(doc: UserDocument): AuthUser {
  return {
    id: doc._id!.toHexString(),
    email: doc.email,
    name: doc.name,
    ...(doc.phone ? { phone: doc.phone } : {}),
    role: doc.role,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function registerCustomer(
  input: RegisterCustomerInput,
  meta: { ip?: string; userAgent?: string }
): Promise<{ user: AuthUser; sessionToken: string }> {
  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const existing = await users.findOne({ email: input.email });

  if (existing) {
    throw new ApiError(
      "CONFLICT",
      "An account with this email already exists.",
      409
    );
  }

  const now = new Date();
  const passwordHash = await hashPassword(input.password);

  // Strictly hardcode role: CUSTOMER — customers can never register as ADMIN
  const newUser: UserDocument = {
    email: input.email,
    name: input.name,
    ...(input.phone ? { phone: input.phone } : {}),
    passwordHash,
    role: USER_ROLES.CUSTOMER,
    status: "ACTIVE",
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: now,
    updatedAt: now,
  };

  let insertedId: ObjectId;
  try {
    const res = await users.insertOne(newUser);
    insertedId = res.insertedId;
  } catch (err) {
    const e = err as { code?: number };
    if (e?.code === 11000) {
      throw new ApiError(
        "CONFLICT",
        "An account with this email already exists.",
        409
      );
    }
    throw err;
  }

  newUser._id = insertedId;
  const sessionToken = await createSession({
    userId: insertedId,
    role: USER_ROLES.CUSTOMER,
    scope: "CUSTOMER",
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return { user: toPublicUser(newUser), sessionToken };
}

export async function authenticateUser(
  input: LoginInput,
  expectedScope: SessionScope,
  meta: { ip?: string; userAgent?: string }
): Promise<{ user: AuthUser; sessionToken: string }> {
  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const user = await users.findOne({ email: input.email });

  if (!user) {
    throw new ApiError("UNAUTHORIZED", "Invalid email or password", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError("FORBIDDEN", "This account is suspended", 403);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new ApiError(
      "TOO_MANY_REQUESTS",
      "Account temporarily locked due to repeated failed login attempts. Try again later.",
      429
    );
  }

  // Enforce strict role separation between Admin and Customer login endpoints
  if (expectedScope === "ADMIN" && user.role !== USER_ROLES.ADMIN) {
    throw new ApiError("UNAUTHORIZED", "Invalid email or password", 401);
  }
  if (expectedScope === "CUSTOMER" && user.role !== USER_ROLES.CUSTOMER) {
    throw new ApiError("UNAUTHORIZED", "Invalid email or password", 401);
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    const nextAttempts = (user.failedLoginAttempts || 0) + 1;
    const lockedUntil =
      nextAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          failedLoginAttempts: nextAttempts,
          lockedUntil,
          updatedAt: new Date(),
        },
      }
    );

    if (lockedUntil) {
      throw new ApiError(
        "TOO_MANY_REQUESTS",
        "Account temporarily locked due to repeated failed login attempts. Try again later.",
        429
      );
    }

    throw new ApiError("UNAUTHORIZED", "Invalid email or password", 401);
  }

  // Reset failed attempts on successful login
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date(),
        },
      }
    );
  }

  const sessionToken = await createSession({
    userId: user._id!,
    role: user.role,
    scope: expectedScope,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return { user: toPublicUser(user), sessionToken };
}

export async function requestCustomerPasswordReset(
  email: string
): Promise<{ devResetToken?: string }> {
  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const user = await users.findOne({ email, role: USER_ROLES.CUSTOMER, status: "ACTIVE" });

  // Always succeed silently if no user exists to prevent account enumeration
  if (!user || !user._id) {
    return {};
  }

  const rawToken = generateOpaqueToken(32);
  const tokenHash = hashToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS);

  const resets = await getCollection<PasswordResetDocument>(COLLECTIONS.PASSWORD_RESETS);
  await resets.insertOne({
    tokenHash,
    userId: user._id,
    expiresAt,
    usedAt: null,
    createdAt: now,
  });

  if (process.env.NODE_ENV !== "production") {
    return { devResetToken: rawToken };
  }

  return {};
}

export async function resetCustomerPassword(
  rawToken: string,
  newPassword: string
): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const resets = await getCollection<PasswordResetDocument>(COLLECTIONS.PASSWORD_RESETS);
  const resetDoc = await resets.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!resetDoc) {
    throw new ApiError("BAD_REQUEST", "Reset token is invalid or has expired", 400);
  }

  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const user = await users.findOne({ _id: resetDoc.userId, role: USER_ROLES.CUSTOMER });
  if (!user || !user._id) {
    throw new ApiError("BAD_REQUEST", "Reset token is invalid or has expired", 400);
  }

  const newHash = await hashPassword(newPassword);
  const now = new Date();

  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash: newHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: now,
      },
    }
  );

  await resets.updateOne({ _id: resetDoc._id }, { $set: { usedAt: now } });
  await revokeAllUserSessions(user._id);
}

export async function updateCustomerProfile(
  userId: ObjectId,
  input: UpdateCustomerProfileInput
): Promise<AuthUser> {
  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const now = new Date();

  const updated = await users.findOneAndUpdate(
    { _id: userId, role: USER_ROLES.CUSTOMER, status: "ACTIVE" },
    {
      $set: {
        name: input.name,
        ...(input.phone ? { phone: input.phone } : { phone: "" }),
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  if (!updated) {
    throw new ApiError("NOT_FOUND", "Customer account not found", 404);
  }

  return toPublicUser(updated);
}
