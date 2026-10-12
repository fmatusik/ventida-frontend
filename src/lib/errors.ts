/**
 * Wyciąga czytelny komunikat z błędu axiosa. NestJS przy błędach walidacji zwraca
 * `message` jako tablicę - łączymy ją w jedno zdanie zamiast pokazywać "[object Object]".
 */
export function apiError(err: unknown, fallback: string): string {
  const e = err as {
    response?: { status?: number; data?: { message?: string | string[] } };
    code?: string;
  };
  if (!e?.response) {
    return e?.code === "ERR_NETWORK" ? "Nie udało się połączyć z serwerem" : fallback;
  }
  if (e.response.status === 429) {
    return "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.";
  }
  const msg = e.response.data?.message;
  if (Array.isArray(msg)) return msg.join(". ");
  if (typeof msg === "string" && msg) return msg;
  return fallback;
}
