const KEY = "accessToken";

export const AUTH_EVENT = "ventida:auth-changed";

export function getToken(): string | null {
  try {
    return typeof window === "undefined" ? null : localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* tryb prywatny / zablokowany storage */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
}

/** Przekierowanie po logowaniu: tylko wewnętrzne ścieżki (blokuje open redirect). */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/";
  return next;
}
