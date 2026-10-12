const SERVER = (process.env.NEXT_PUBLIC_SERVER_URL ?? "").replace(/\/$/, "");

/**
 * Zamienia adres z API na bezpieczny adres obrazka.
 * Ścieżki względne (/uploads/...) dostają adres backendu, a obce schematy
 * (javascript:, data:, itp.) są odrzucane.
 */
export function mediaUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("https://") || url.startsWith("http://")) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return SERVER + url;
  return "";
}
