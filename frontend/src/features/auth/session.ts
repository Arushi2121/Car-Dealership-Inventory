import { clearToken, getToken, setToken } from '../../shared/lib/tokenStore';

export type Role = 'USER' | 'ADMIN';

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

export type Session = {
  token: string;
  user: SessionUser;
};

const USER_KEY = 'marque_user';

/** Stores the token and the user. The user is for display only; the server re-checks the role. */
export function saveSession(session: Session): void {
  setToken(session.token);
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  } catch {
    // Storage unavailable: the session lasts until the page reloads.
  }
}

/** Returns the stored session, or null if any part is missing, unreadable or expired. */
export function loadSession(): Session | null {
  const token = getToken();
  if (!token || isExpired(token)) return null;
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) return null;
    return { token, user: JSON.parse(storedUser) as SessionUser };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  clearToken();
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // Nothing stored that we could remove.
  }
}

// Reads only the exp claim. The signature is never checked here; the server does that.
function isExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
