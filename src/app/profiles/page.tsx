import { redirect } from "next/navigation";

// Wyszukiwarka użytkowników jest częścią /listing?type=profiles - ten adres zostaje dla starych linków.
export default async function ProfilesRedirect({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const params = new URLSearchParams({ type: "profiles" });
  if (q) params.set("q", q);
  redirect(`/listing?${params.toString()}`);
}
