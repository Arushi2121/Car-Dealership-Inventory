import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { setUnauthorizedHandler } from '../../shared/lib/api';
import * as authApi from './authApi';
import type { Credentials, Registration } from './authApi';
import { clearSession, loadSession, saveSession } from './session';
import type { Session, SessionUser } from './session';

type AuthContextValue = {
  user: SessionUser | null;
  isAdmin: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (registration: Registration) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => loadSession()?.user ?? null);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // Any 401 means the token is missing, invalid or expired, so drop the session everywhere.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(() => {});
  }, [logout]);

  const value = useMemo<AuthContextValue>(() => {
    function startSession(session: Session) {
      saveSession(session);
      setUser(session.user);
    }
    return {
      user,
      isAdmin: user?.role === 'ADMIN',
      login: async (credentials) => startSession(await authApi.login(credentials)),
      register: async (registration) => startSession(await authApi.register(registration)),
      logout,
    };
  }, [user, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
