"use client";
import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Loader2, MapPin, PackageSearch, Search, Star, UserSearch } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import CategoryPicker from "@/components/CategoryPicker";
import ListingCard, { ListingCardSkeleton } from "@/components/ListingCard";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { CategoryDto } from "@/models";
import { ShortListingSummaryDto } from "@/models/listing/ListingDto";
import { AccountDetailDto } from "@/models/user/AccountDetailDto";

const PAGE_SIZE = 12;

function ListingBrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Adres URL jest jedynym źródłem prawdy - działa przycisk "wstecz" i udostępnianie linków
  const type: "listings" | "profiles" = searchParams.get("type") === "profiles" ? "profiles" : "listings";
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const location = searchParams.get("location") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [form, setForm] = useState({ q, location, categoryId, minPrice, maxPrice });
  const [showFilters, setShowFilters] = useState(Boolean(categoryId || minPrice || maxPrice));
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [listings, setListings] = useState<ShortListingSummaryDto[]>([]);
  const [users, setUsers] = useState<AccountDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- formularz odzwierciedla parametry URL (np. po kliknięciu "wstecz")
    setForm({ q, location, categoryId, minPrice, maxPrice });
  }, [q, location, categoryId, minPrice, maxPrice]);

  useEffect(() => {
    api
      .get("/category/root")
      .then((res) => setCategories(res.data.data || []))
      .catch(() => console.error("Error fetching categories"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        if (type === "listings") {
          const params = new URLSearchParams({
            skip: String((page - 1) * PAGE_SIZE),
            take: String(PAGE_SIZE),
          });
          if (categoryId) params.set("categoryId", categoryId);
          if (q) params.set("q", q);
          if (minPrice) params.set("minPrice", minPrice);
          if (maxPrice) params.set("maxPrice", maxPrice);
          if (location) params.set("location", location);
          const res = await api.get(`/listing?${params.toString()}`);
          if (!cancelled) {
            setListings(res.data.data || []);
            setUsers([]);
          }
        } else {
          const res = await api.get(`/user/search?q=${encodeURIComponent(q)}`);
          if (!cancelled) {
            setUsers(res.data || []);
            setListings([]);
          }
        }
      } catch (err) {
        if (!cancelled) setError(apiError(err, "Błąd przy pobieraniu danych"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [type, q, categoryId, location, minPrice, maxPrice, page]);

  const go = (next: Record<string, string>, resetPage = true) => {
    const params = new URLSearchParams();
    const merged: Record<string, string> = { type, q, categoryId, location, minPrice, maxPrice, ...next };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && !(k === "type" && v === "listings")) params.set(k, v);
    });
    if (!resetPage && next.page && next.page !== "1") params.set("page", next.page);
    const qs = params.toString();
    router.push(qs ? `/listing?${qs}` : "/listing");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    go({ ...form });
  };

  const changePage = (p: number) => {
    go({ page: String(p) }, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilters = [categoryId, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container-page pb-10 pt-28 sm:pt-32">
        <div className="mb-8 flex justify-center">
          <div role="tablist" aria-label="Typ wyszukiwania" className="flex gap-1 rounded-2xl bg-neutral-200/70 p-1">
            {(
              [
                ["listings", "Ogłoszenia"],
                ["profiles", "Użytkownicy"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                role="tab"
                aria-selected={type === value}
                onClick={() => go({ type: value })}
                className={`rounded-xl px-8 py-2.5 text-sm font-semibold transition-all ${
                  type === value ? "bg-white text-primary shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="mb-8 space-y-4" role="search">
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                aria-label={type === "listings" ? "Czego szukasz?" : "Szukaj użytkownika"}
                placeholder={type === "listings" ? "Czego szukasz?" : "Szukaj użytkownika..."}
                value={form.q}
                maxLength={100}
                onChange={(e) => setForm({ ...form, q: e.target.value })}
                className="input !rounded-2xl !py-4 pl-12 shadow-sm"
              />
            </div>

            {type === "listings" && (
              <div className="relative md:w-64">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  aria-label="Miejscowość"
                  placeholder="Miejscowość"
                  value={form.location}
                  maxLength={100}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input !rounded-2xl !py-4 pl-12 shadow-sm"
                />
              </div>
            )}

            <button type="submit" className="btn-primary !rounded-2xl !px-8 !py-4">
              Szukaj
            </button>

            {type === "listings" && (
              <button
                type="button"
                onClick={() => setShowFilters((s) => !s)}
                aria-expanded={showFilters}
                aria-label="Filtry"
                className={`btn relative !rounded-2xl !px-4 !py-4 border ${
                  showFilters ? "border-primary bg-primary-soft text-primary" : "border-neutral-200 bg-white"
                }`}
              >
                <Filter className="h-5 w-5" />
                {activeFilters > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                    {activeFilters}
                  </span>
                )}
              </button>
            )}
          </div>

          {showFilters && type === "listings" && (
            <div className="card space-y-6 p-6">
              <CategoryPicker
                categories={categories}
                initialCategoryId={form.categoryId}
                onCategoryChange={(id) => setForm((f) => ({ ...f, categoryId: id }))}
                label="Kategoria"
              />

              <div className="grid gap-6 md:grid-cols-2">
                <fieldset className="space-y-2">
                  <legend className="label">Cena (zł)</legend>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      inputMode="decimal"
                      aria-label="Cena od"
                      placeholder="Od"
                      value={form.minPrice}
                      onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                      className="input"
                    />
                    <span className="text-neutral-400">–</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="decimal"
                      aria-label="Cena do"
                      placeholder="Do"
                      value={form.maxPrice}
                      onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                      className="input"
                    />
                  </div>
                </fieldset>

                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => router.push("/listing")}
                    className="text-sm text-neutral-500 underline transition-colors hover:text-primary"
                  >
                    Wyczyść wszystkie filtry
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {loading ? (
          type === "listings" ? (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-20 text-neutral-500">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
              Ładowanie wyników...
            </div>
          )
        ) : error ? (
          <div role="alert" className="alert-error text-center">
            {error}
          </div>
        ) : type === "listings" ? (
          listings.length === 0 ? (
            <div className="card px-6 py-20 text-center">
              <PackageSearch className="mx-auto mb-4 h-14 w-14 text-neutral-300" strokeWidth={1.25} />
              <h2 className="mb-2 text-xl font-semibold">Brak ogłoszeń</h2>
              <p className="text-neutral-500">Spróbuj zmienić parametry wyszukiwania.</p>
            </div>
          ) : (
            <>
              <div className="mb-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((item) => (
                  <ListingCard key={item.id} item={item} />
                ))}
              </div>

              <nav className="mb-12 flex items-center justify-center gap-4" aria-label="Paginacja">
                <button onClick={() => changePage(page - 1)} disabled={page === 1} className="btn-outline">
                  Poprzednia
                </button>
                <span className="text-sm text-neutral-500">Strona {page}</span>
                <button onClick={() => changePage(page + 1)} disabled={listings.length < PAGE_SIZE} className="btn-outline">
                  Następna
                </button>
              </nav>
            </>
          )
        ) : users.length === 0 ? (
          <div className="card px-6 py-20 text-center">
            <UserSearch className="mx-auto mb-4 h-14 w-14 text-neutral-300" strokeWidth={1.25} />
            <h2 className="mb-2 text-xl font-semibold">Nie znaleziono użytkowników</h2>
            <p className="text-neutral-500">{q ? "Spróbuj wyszukać kogoś innego." : "Wpisz nazwę użytkownika, aby go wyszukać."}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {users.map((profile) => (
              <Link
                key={profile.id}
                href={`/account?id=${profile.id}`}
                className="card group p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="mb-4 flex items-center gap-4">
                  <Avatar name={profile.username} src={profile.pictureUrl} size={64} />
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold transition-colors group-hover:text-primary">
                      {profile.username || "Użytkownik"}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-neutral-600">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      {(profile.rating || 0).toFixed(1)}
                      <span className="text-neutral-400">({profile.reviews ?? 0})</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <MapPin className="h-4 w-4" />
                    {profile.city || "Polska"}
                  </div>
                  <p className="line-clamp-2 text-sm italic text-neutral-600">{profile.description || "Brak opisu profilu"}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function ListingBrowse() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ListingBrowseContent />
    </Suspense>
  );
}
