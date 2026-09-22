import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import jwt from 'jsonwebtoken';
import {Admin, APIError} from '@siku-zangu/core';
import {selectOneAdminByUserId} from '@siku-zangu/knex';

/**
 * Shared auth guard for the API routes.
 *
 * There are two credential systems in this app and they are not interchangeable:
 *
 *  - **Admin sessions** — the `_aus` httpOnly cookie, a `jose` HS256 JWT
 *    carrying the admin's user id in `aud`. Issued by `POST /api/sessions`.
 *    Used by the web dashboard.
 *  - **User tokens** — an `Authorization: Bearer` JWT carrying
 *    `{user_id, phone_number}`. Issued by `POST /api/users/auth`. Used by the
 *    mobile app.
 *
 * Both are HS256 and both are signed with `S_JWT_SIGNING_KEY`. They were
 * originally built independently with separate secrets; one secret means one
 * thing to configure and one thing to rotate. `jose` takes the key as bytes and
 * `jsonwebtoken` takes it as a utf-8 string, which is the same key either way.
 *
 * The secret falls back to a development constant when unset so the app always
 * starts. That constant is public in this repo, so set `S_JWT_SIGNING_KEY`
 * anywhere real accounts exist; production logs a warning when it is missing.
 */

const DEV_SIGNING_SECRET = 'IcAchOsEVerSewAChMarKoHI';

let warnedAboutSecret = false;

/**
 * The one signing secret, for both token types.
 *
 * Always returns a usable value so the app starts and serves without any env
 * configuration. The fallback is a constant that is public in this repo's
 * history, so anything signed with it can be forged by anyone who reads the
 * repo — set `S_JWT_SIGNING_KEY` in any environment holding real accounts.
 * In production a missing value logs once rather than on every request.
 */
export function getSigningSecret(): string {
  const value = process.env.S_JWT_SIGNING_KEY;
  if (value) return value;

  if (process.env.NODE_ENV === 'production' && !warnedAboutSecret) {
    warnedAboutSecret = true;
    console.warn(
      '[auth] S_JWT_SIGNING_KEY is not set. Falling back to the development ' +
        'secret, which is public in the repository — session and access tokens ' +
        'are forgeable until this is configured.'
    );
  }
  return DEV_SIGNING_SECRET;
}

/** Same secret, as bytes, for `jose`. */
export const getSigningKeyBytes = (): Uint8Array =>
  new TextEncoder().encode(getSigningSecret());

/**
 * Enforcement switch for the mobile-facing user routes.
 *
 * The shipped mobile app stores its token but has never sent it, so requiring
 * it would 401 every install until users update — and store review takes days.
 * Mobile now sends the header; flip this to `true` once 1.1.0 has rolled out.
 */
export const REQUIRE_USER_AUTH = process.env.REQUIRE_USER_AUTH === 'true';

export const UNAUTHORISED: APIError = {
  status: 401,
  message: 'Unauthorised',
};

export const FORBIDDEN: APIError = {
  status: 403,
  message: 'You do not have permission to perform this action',
};

export type Principal =
  | { kind: 'admin'; userId: string; admin: Admin }
  | { kind: 'user'; userId: string };

/** The admin behind the `_aus` cookie, or null. Never throws on a bad token. */
export async function getSessionAdmin(): Promise<Admin | null> {
  const store = await cookies();
  const ausCookie = store.get('_aus')?.value;
  if (!ausCookie) return null;

  // Resolved OUTSIDE the try: a bad cookie is an auth failure and returns null,
  // but a missing secret is a config failure and must surface, not be swallowed
  // into "no admin" — that would silently disable every check below.
  const secret = getSigningKeyBytes();

  try {
    const { payload } = await jwtVerify(ausCookie, secret, {
      algorithms: ['HS256'],
    });
    const adminId = payload.aud as string | undefined;
    if (!adminId) return null;

    const admin = await selectOneAdminByUserId(adminId);
    return admin ?? null;
  } catch {
    // Expired, tampered with, or the admin no longer exists.
    return null;
  }
}

/** The user id behind a bearer token, or null. Never throws on a bad token. */
export function getBearerUserId(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  if (!header?.toLowerCase().startsWith('bearer ')) return null;

  const token = header.slice(7).trim();
  if (!token) return null;

  // Same reasoning as above: config errors must not look like "no token".
  const secret = getSigningSecret();

  try {
    const payload = jwt.verify(token, secret) as { user_id?: string };
    return payload?.user_id ?? null;
  } catch {
    return null;
  }
}

/** Resolves whoever is calling, preferring an admin session. */
export async function getPrincipal(
  req: NextRequest
): Promise<Principal | null> {
  const admin = await getSessionAdmin();
  if (admin?.user_id) {
    return { kind: 'admin', userId: admin.user_id, admin };
  }

  const userId = getBearerUserId(req);
  return userId ? { kind: 'user', userId } : null;
}

/**
 * Require a signed-in admin. Throws `APIError` for `handleAPIError` to render.
 *
 * Note the existing articles route returned a 401 *body* with a 500 *status*;
 * throwing keeps the two in step.
 */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getSessionAdmin();
  if (!admin) throw UNAUTHORISED;
  // An admin who has been deactivated should lose access immediately rather
  // than keep a valid 30-day cookie.
  if (admin.status === 'inactive') throw FORBIDDEN;
  return admin;
}

/**
 * Require the caller to be the user named in the path, or any admin.
 *
 * While `REQUIRE_USER_AUTH` is off this only *upgrades* the request when a
 * credential is present — it never rejects — so older mobile builds keep
 * working. Flip the flag to close it.
 */
export async function requireSelfOrAdmin(
  req: NextRequest,
  targetUserId: string
): Promise<Principal | null> {
  const principal = await getPrincipal(req);

  if (!principal) {
    if (REQUIRE_USER_AUTH) throw UNAUTHORISED;
    return null;
  }

  if (principal.kind === 'admin') {
    if (principal.admin.status === 'inactive') throw FORBIDDEN;
    return principal;
  }

  if (principal.userId !== targetUserId) {
    // A valid token for a different account is always a hard failure, flag or
    // not — this is the "guess an id and PATCH someone else" hole.
    throw FORBIDDEN;
  }

  return principal;
}
