/**
 * Bearer token used by the mobile client.
 *
 * The app has always issued a JWT at login and stored it, but never sent it —
 * every request went out unauthenticated. Rather than thread a token argument
 * through every call site, the fetch helpers read it from here.
 *
 * The web admin never sets it and stays on its `_aus` session cookie, so
 * `authHeaders()` is empty there and nothing changes.
 */

let currentToken: string | null = null;

/** Called after login, on app bootstrap, and with null on logout. */
export function setAuthToken(token: string | null | undefined): void {
  currentToken = token ?? null;
}

export function getAuthToken(): string | null {
  return currentToken;
}

/** `Authorization` header when a token is held, otherwise nothing. */
export function authHeaders(): Record<string, string> {
  return currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
}
