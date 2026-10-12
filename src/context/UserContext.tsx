"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserResponseDto } from "@/models/user/UserResponseDto";
import api from "@/lib/api";
import { AUTH_EVENT, clearToken, getToken, setToken } from "@/lib/auth";

type UserContextType = {
  user: UserResponseDto | null;
  setUser: (user: UserResponseDto | null) => void;
  isLoading: boolean;
  /** Zapisuje token i pobiera profil. */
  login: (token: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refresh: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get<UserResponseDto>("/user/me");
      setUser(res.data);
    } catch {
      // 401 czyści token w interceptorze; błąd sieci zostawia sesję bez zmian
      if (!getToken()) setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pobranie sesji z API przy starcie
    refresh();
  }, [refresh]);

  // Wylogowanie/zalogowanie w innej karcie albo wygaśnięcie tokenu
  useEffect(() => {
    const sync = () => {
      if (!getToken()) setUser(null);
    };
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const login = useCallback(
    async (token: string) => {
      setToken(token);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser, isLoading, login, logout, refresh }),
    [user, isLoading, login, logout, refresh],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);

/**
 * Dla stron wymagających logowania: po zakończeniu ładowania sesji kieruje
 * niezalogowanych na /login (z powrotem na bieżącą stronę po zalogowaniu).
 */
export function useRequireAuth() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  return { user, isLoading, ready: !isLoading && !!user };
}
